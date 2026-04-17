use crate::db::{initialize_database_at_default_location, Database};
use aes_gcm_siv::aead::{Aead, KeyInit};
use aes_gcm_siv::{Aes256GcmSiv, Nonce};
use base64::engine::general_purpose::STANDARD as BASE64;
use base64::Engine;
use rand::RngCore;
use reqwest::blocking::Client;
use reqwest::header::{AUTHORIZATION, CONTENT_TYPE};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::collections::hash_map::DefaultHasher;
use std::fs;
use std::hash::{Hash, Hasher};
use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::Manager;
use tauri::State;

pub struct AppState {
    pub database: Mutex<Database>,
    pub app_data_dir: PathBuf,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveAccountPayload {
    pub platform: String,
    pub platform_base_url: Option<String>,
    pub display_name: String,
    pub git_username: String,
    pub git_email: String,
    pub default_auth_type: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VerifyAccountPayload {
    pub platform: String,
    pub platform_base_url: Option<String>,
    pub git_username: String,
    pub git_email: String,
    pub auth_type: String,
    pub token: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveCredentialPayload {
    pub account_id: String,
    pub display_name: String,
    pub credential_type: String,
    pub username_hint: String,
    pub secret_value: String,
    pub source_path: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveRepositoryPayload {
    pub account_id: String,
    pub credential_id: String,
    pub name: String,
    pub local_path: String,
    pub remote_url: String,
    pub default_branch: String,
    pub author_filter_value: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GenerateReportPayload {
    pub repository_id: String,
    pub report_date: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveLLMProviderPayload {
    pub provider_name: String,
    pub base_url: String,
    pub model: String,
    pub api_key: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TestLLMProviderPayload {
    pub base_url: String,
    pub model: String,
    pub api_key: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProviderModelsResult {
    pub models: Vec<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RevealSecretPayload {
    pub secret_ref: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveResult {
    pub id: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AccountRecord {
    pub id: String,
    pub platform: String,
    pub platform_base_url: Option<String>,
    pub display_name: String,
    pub git_username: String,
    pub git_email: String,
    pub default_auth_type: String,
    pub verification_status: String,
    pub verification_message: Option<String>,
    pub last_verified_at: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AccountVerificationResult {
    pub status: String,
    pub message: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CredentialRecord {
    pub id: String,
    pub account_id: String,
    pub r#type: String,
    pub display_name: String,
    pub username_hint: String,
    pub secret_ref: String,
    pub secret_mask: String,
    pub source_path: Option<String>,
    pub verification_status: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DiscoveredSSHKey {
    pub display_name: String,
    pub source_path: String,
    pub username_hint: String,
    pub secret_mask: String,
    pub secret_value: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RepositoryRecord {
    pub id: String,
    pub name: String,
    pub local_path: String,
    pub remote_url: String,
    pub default_branch: String,
    pub author_filter_value: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GenerateReportResult {
    pub output_path: String,
    pub content: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReportRunRecord {
    pub id: String,
    pub repository_id: String,
    pub report_date: String,
    pub output_path: String,
    pub created_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LLMProviderRecord {
    pub id: String,
    pub provider_name: String,
    pub base_url: String,
    pub model: String,
    pub api_key_ref: String,
    pub api_key_mask: String,
    pub last_tested_at: Option<String>,
    pub test_status: String,
    pub is_active: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SecretRevealResult {
    pub value: String,
}

fn iso_now() -> String {
    let secs = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("time went backwards")
        .as_secs();
    format!("{secs}")
}

fn unique_id(prefix: &str) -> String {
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("time went backwards")
        .as_nanos();
    format!("{prefix}-{nanos}")
}

fn secret_key(app_data_dir: &Path) -> [u8; 32] {
    let mut hasher = DefaultHasher::new();
    app_data_dir.to_string_lossy().hash(&mut hasher);
    let seed = hasher.finish().to_le_bytes();
    let mut key = [0u8; 32];
    for chunk in key.chunks_mut(8) {
        chunk.copy_from_slice(&seed);
    }
    key
}

fn secret_store_path(app_data_dir: &Path) -> PathBuf {
    app_data_dir.join("secure").join("secrets.json")
}

fn load_secret_store(app_data_dir: &Path) -> Result<serde_json::Map<String, serde_json::Value>, String> {
    let path = secret_store_path(app_data_dir);
    if !path.exists() {
        return Ok(serde_json::Map::new());
    }

    let raw = fs::read_to_string(path).map_err(|error| error.to_string())?;
    let value: serde_json::Value = serde_json::from_str(&raw).map_err(|error| error.to_string())?;
    Ok(value.as_object().cloned().unwrap_or_default())
}

fn save_secret_store(
    app_data_dir: &Path,
    store: &serde_json::Map<String, serde_json::Value>,
) -> Result<(), String> {
    let secure_dir = app_data_dir.join("secure");
    fs::create_dir_all(&secure_dir).map_err(|error| error.to_string())?;
    let content = serde_json::to_string_pretty(store).map_err(|error| error.to_string())?;
    fs::write(secret_store_path(app_data_dir), content).map_err(|error| error.to_string())
}

fn encrypt_secret(app_data_dir: &Path, value: &str) -> Result<String, String> {
    let key = secret_key(app_data_dir);
    let cipher = Aes256GcmSiv::new_from_slice(&key).map_err(|error| error.to_string())?;
    let mut nonce = [0u8; 12];
    rand::thread_rng().fill_bytes(&mut nonce);
    let ciphertext = cipher
        .encrypt(Nonce::from_slice(&nonce), value.as_bytes())
        .map_err(|error| error.to_string())?;
    Ok(format!("{}:{}", BASE64.encode(nonce), BASE64.encode(ciphertext)))
}

fn decrypt_secret(app_data_dir: &Path, value: &str) -> Result<String, String> {
    let (nonce_part, cipher_part) = value
        .split_once(':')
        .ok_or_else(|| "invalid encrypted secret format".to_string())?;
    let nonce_bytes = BASE64.decode(nonce_part).map_err(|error| error.to_string())?;
    let cipher_bytes = BASE64.decode(cipher_part).map_err(|error| error.to_string())?;
    let key = secret_key(app_data_dir);
    let cipher = Aes256GcmSiv::new_from_slice(&key).map_err(|error| error.to_string())?;
    let plain = cipher
        .decrypt(Nonce::from_slice(&nonce_bytes), cipher_bytes.as_ref())
        .map_err(|error| error.to_string())?;
    String::from_utf8(plain).map_err(|error| error.to_string())
}

fn save_secret_value(app_data_dir: &Path, secret_ref: &str, value: &str) -> Result<(), String> {
    let mut store = load_secret_store(app_data_dir)?;
    store.insert(
        secret_ref.to_string(),
        json!({
            "value": encrypt_secret(app_data_dir, value)?,
            "updatedAt": iso_now()
        }),
    );
    save_secret_store(app_data_dir, &store)
}

fn load_secret_value(app_data_dir: &Path, secret_ref: &str) -> Result<String, String> {
    let store = load_secret_store(app_data_dir)?;
    let encrypted = store
        .get(secret_ref)
        .and_then(|value| value.get("value"))
        .and_then(|value| value.as_str())
        .ok_or_else(|| "secret not found".to_string())?;
    decrypt_secret(app_data_dir, encrypted)
}

fn mask_secret(value: &str) -> String {
    let trimmed = value.trim();
    if trimmed.is_empty() {
        return "****".to_string();
    }

    let visible = trimmed.chars().count().min(4);
    let suffix = trimmed
        .chars()
        .rev()
        .take(visible)
        .collect::<Vec<_>>()
        .into_iter()
        .rev()
        .collect::<String>();

    format!("****{suffix}")
}

fn normalize_api_base_url(base_url: &str) -> String {
    base_url.trim().trim_end_matches('/').to_string()
}

fn normalize_llm_endpoint(base_url: &str) -> String {
    let normalized = normalize_api_base_url(base_url);
    if normalized.ends_with("/chat/completions") {
        normalized
    } else if normalized.ends_with("/v1")
        || normalized.ends_with("/v2")
        || normalized.ends_with("/v3")
        || normalized.ends_with("/v4")
    {
        format!("{normalized}/chat/completions")
    } else {
        format!("{normalized}/chat/completions")
    }
}

fn post_chat_completion(
    base_url: &str,
    api_key: &str,
    model: &str,
    user_content: &str,
) -> Result<String, String> {
    let client = Client::builder()
        .timeout(std::time::Duration::from_secs(20))
        .build()
        .map_err(|error| error.to_string())?;

    let response = client
        .post(normalize_llm_endpoint(base_url))
        .header(CONTENT_TYPE, "application/json")
        .header(AUTHORIZATION, format!("Bearer {api_key}"))
        .json(&json!({
            "model": model,
            "messages": [
                {
                    "role": "system",
                    "content": "You are a precise assistant. Return concise and valid responses only."
                },
                {
                    "role": "user",
                    "content": user_content
                }
            ],
            "temperature": 0.3
        }))
        .send()
        .map_err(|error| error.to_string())?;

    let status = response.status();
    let body: serde_json::Value = response.json().map_err(|error| error.to_string())?;

    if !status.is_success() {
        return Err(format!("LLM request failed: {status}"));
    }

    Ok(body["choices"][0]["message"]["content"]
        .as_str()
        .unwrap_or("No summary returned")
        .to_string())
}

fn git_config_value(args: &[&str]) -> Option<String> {
    let output = Command::new("git").args(args).output().ok()?;
    if !output.status.success() {
        return None;
    }
    let value = String::from_utf8_lossy(&output.stdout).trim().to_string();
    if value.is_empty() {
        None
    } else {
        Some(value)
    }
}

fn discover_ssh_key_candidates() -> Vec<PathBuf> {
    let mut candidates = Vec::new();
    if let Some(home_dir) = dirs::home_dir() {
        let ssh_dir = home_dir.join(".ssh");
        let common = [
            "id_ed25519",
            "id_rsa",
            "id_ecdsa",
            "id_dsa",
            "id_github",
            "id_gitlab",
        ];
        for item in common {
            let path = ssh_dir.join(item);
            if path.exists() {
                candidates.push(path);
            }
        }

        if let Ok(entries) = fs::read_dir(ssh_dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_file() {
                    let file_name = path.file_name().and_then(|value| value.to_str()).unwrap_or_default();
                    if file_name.starts_with("id_") && !file_name.ends_with(".pub") && !candidates.contains(&path) {
                        candidates.push(path);
                    }
                }
            }
        }
    }
    candidates
}

fn infer_platform_url(platform: &str, platform_base_url: Option<&str>) -> String {
    match platform {
        "github" => "https://api.github.com/user".to_string(),
        "gitlab" => format!(
            "{}/api/v4/user",
            platform_base_url
                .unwrap_or("https://gitlab.com")
                .trim_end_matches('/')
        ),
        "gitea" => format!(
            "{}/api/v1/user",
            platform_base_url
                .unwrap_or("https://gitea.com")
                .trim_end_matches('/')
        ),
        "gitee" => format!(
            "{}/api/v5/user",
            platform_base_url
                .unwrap_or("https://gitee.com")
                .trim_end_matches('/')
        ),
        _ => format!(
            "{}/api/user",
            platform_base_url.unwrap_or("https://example.com").trim_end_matches('/')
        ),
    }
}

fn normalize_models_endpoint(base_url: &str) -> String {
    let normalized = normalize_api_base_url(base_url);
    if normalized.ends_with("/chat/completions") {
        normalized.trim_end_matches("/chat/completions").to_string() + "/models"
    } else if normalized.ends_with("/v1")
        || normalized.ends_with("/v2")
        || normalized.ends_with("/v3")
        || normalized.ends_with("/v4")
    {
        format!("{normalized}/models")
    } else {
        format!("{normalized}/models")
    }
}

fn fetch_models(base_url: &str, api_key: &str) -> Result<Vec<String>, String> {
    let client = Client::builder()
        .timeout(std::time::Duration::from_secs(20))
        .build()
        .map_err(|error| error.to_string())?;

    let response = client
        .get(normalize_models_endpoint(base_url))
        .header(AUTHORIZATION, format!("Bearer {api_key}"))
        .header("User-Agent", "git-daily-reporter")
        .send()
        .map_err(|error| error.to_string())?;

    let status = response.status();
    let body: serde_json::Value = response.json().map_err(|error| error.to_string())?;
    if !status.is_success() {
        return Err(format!("Model list request failed: {status}"));
    }

    let models = body["data"]
        .as_array()
        .map(|items| {
            items
                .iter()
                .filter_map(|item| item["id"].as_str().map(ToString::to_string))
                .collect::<Vec<_>>()
        })
        .unwrap_or_default();

    if models.is_empty() {
        return Err("No models returned by provider".to_string());
    }

    Ok(models)
}

#[tauri::command]
pub fn save_account(
    state: State<AppState>,
    payload: SaveAccountPayload,
) -> Result<AccountRecord, String> {
    let mut db = state.database.lock().map_err(|_| "database lock poisoned".to_string())?;
    let id = unique_id("acc");
    db.save_account(
        &id,
        &payload.platform,
        payload.platform_base_url.as_deref(),
        &payload.display_name,
        &payload.git_username,
        &payload.git_email,
        &payload.default_auth_type,
        "unverified",
        None,
        None,
    )
    .map_err(|error| error.to_string())?;

    Ok(AccountRecord {
        id,
        platform: payload.platform,
        platform_base_url: payload.platform_base_url,
        display_name: payload.display_name,
        git_username: payload.git_username,
        git_email: payload.git_email,
        default_auth_type: payload.default_auth_type,
        verification_status: "unverified".into(),
        verification_message: None,
        last_verified_at: None,
    })
}

#[tauri::command]
pub fn list_accounts(state: State<AppState>) -> Result<Vec<AccountRecord>, String> {
    let db = state.database.lock().map_err(|_| "database lock poisoned".to_string())?;
    db.list_accounts()
        .map_err(|error| error.to_string())?
        .into_iter()
        .map(
            |(
                id,
                platform,
                platform_base_url,
                display_name,
                git_username,
                git_email,
                default_auth_type,
                verification_status,
                verification_message,
                last_verified_at,
            )| {
                Ok(AccountRecord {
                    id,
                    platform,
                    platform_base_url,
                    display_name,
                    git_username,
                    git_email,
                    default_auth_type,
                    verification_status,
                    verification_message,
                    last_verified_at,
                })
            },
        )
        .collect()
}

#[tauri::command]
pub fn read_git_identity() -> Result<AccountVerificationResult, String> {
    let username = git_config_value(&["config", "--global", "user.name"]).unwrap_or_default();
    let email = git_config_value(&["config", "--global", "user.email"]).unwrap_or_default();
    Ok(AccountVerificationResult {
        status: "ok".into(),
        message: serde_json::to_string(&json!({
            "gitUsername": username,
            "gitEmail": email
        }))
        .map_err(|error| error.to_string())?,
    })
}

#[tauri::command]
pub fn verify_account(payload: VerifyAccountPayload) -> Result<AccountVerificationResult, String> {
    if payload.auth_type == "https_token" {
        let token = payload
            .token
            .filter(|value| !value.trim().is_empty())
            .ok_or_else(|| "token is required for HTTPS verification".to_string())?;
        let endpoint = infer_platform_url(&payload.platform, payload.platform_base_url.as_deref());
        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(15))
            .build()
            .map_err(|error| error.to_string())?;
        let response = client
            .get(endpoint)
            .header(AUTHORIZATION, format!("Bearer {token}"))
            .header("User-Agent", "git-daily-reporter")
            .send()
            .map_err(|error| error.to_string())?;

        if response.status().is_success() {
            return Ok(AccountVerificationResult {
                status: "verified".into(),
                message: "登录验证成功".into(),
            });
        }

        return Ok(AccountVerificationResult {
            status: "failed".into(),
            message: format!("登录验证失败：{}", response.status()),
        });
    }

    let username = if payload.git_username.trim().is_empty() {
        payload.git_email
    } else {
        payload.git_username
    };

    if username.trim().is_empty() {
        return Ok(AccountVerificationResult {
            status: "failed".into(),
            message: "请先填写 Git 用户名或邮箱".into(),
        });
    }

    if payload.platform == "custom" && payload.platform_base_url.as_deref().unwrap_or("").trim().is_empty() {
        return Ok(AccountVerificationResult {
            status: "failed".into(),
            message: "自定义平台需要填写平台地址".into(),
        });
    }

    Ok(AccountVerificationResult {
        status: "verified".into(),
        message: format!("已记录 SSH 认证身份：{username}。当前为基础校验，后续可继续补充真实连通性验证。"),
    })
}

#[tauri::command]
pub fn save_credential(
    state: State<AppState>,
    payload: SaveCredentialPayload,
) -> Result<SaveResult, String> {
    let mut db = state.database.lock().map_err(|_| "database lock poisoned".to_string())?;
    let id = unique_id("cred");
    let secret_ref = format!("app://secret/{id}");
    save_secret_value(&state.app_data_dir, &secret_ref, &payload.secret_value)?;
    db.save_credential(
        &id,
        &payload.account_id,
        &payload.credential_type,
        &payload.display_name,
        &secret_ref,
        &mask_secret(&payload.secret_value),
        payload.source_path.as_deref(),
        &payload.username_hint,
        "saved",
    )
    .map_err(|error| error.to_string())?;

    Ok(SaveResult { id })
}

#[tauri::command]
pub fn list_credentials(state: State<AppState>) -> Result<Vec<CredentialRecord>, String> {
    let db = state.database.lock().map_err(|_| "database lock poisoned".to_string())?;
    db.list_credentials()
        .map_err(|error| error.to_string())?
        .into_iter()
        .map(
            |(
                id,
                account_id,
                credential_type,
                display_name,
                secret_ref,
                source_path,
                username_hint,
                secret_mask,
                verification_status,
            )| {
                Ok(CredentialRecord {
                    id,
                    account_id,
                    r#type: credential_type,
                    display_name,
                    username_hint: username_hint.unwrap_or_default(),
                    secret_ref,
                    secret_mask,
                    source_path,
                    verification_status,
                })
            },
        )
        .collect()
}

#[tauri::command]
pub fn discover_ssh_keys() -> Result<Vec<DiscoveredSSHKey>, String> {
    let mut items = Vec::new();
    for path in discover_ssh_key_candidates() {
        let content = fs::read_to_string(&path).map_err(|error| error.to_string())?;
        if content.trim().is_empty() {
            continue;
        }
        let display_name = path
            .file_name()
            .and_then(|value| value.to_str())
            .unwrap_or("SSH Key")
            .to_string();
        items.push(DiscoveredSSHKey {
            display_name,
            source_path: path.to_string_lossy().to_string(),
            username_hint: dirs::home_dir()
                .and_then(|home| home.file_name().map(|value| value.to_string_lossy().to_string()))
                .unwrap_or_default(),
            secret_mask: mask_secret(&content),
            secret_value: content,
        });
    }
    Ok(items)
}

#[tauri::command]
pub fn reveal_secret(
    state: State<AppState>,
    payload: RevealSecretPayload,
) -> Result<SecretRevealResult, String> {
    let value = load_secret_value(&state.app_data_dir, &payload.secret_ref)?;
    Ok(SecretRevealResult { value })
}

#[tauri::command]
pub fn save_repository(
    state: State<AppState>,
    payload: SaveRepositoryPayload,
) -> Result<SaveResult, String> {
    let mut db = state.database.lock().map_err(|_| "database lock poisoned".to_string())?;
    let id = unique_id("repo");
    db.save_repository(
        &id,
        &payload.name,
        &payload.local_path,
        &payload.remote_url,
        &payload.default_branch,
        &payload.account_id,
        &payload.credential_id,
        &payload.author_filter_value,
    )
    .map_err(|error| error.to_string())?;

    Ok(SaveResult { id })
}

#[tauri::command]
pub fn list_repositories(state: State<AppState>) -> Result<Vec<RepositoryRecord>, String> {
    let db = state.database.lock().map_err(|_| "database lock poisoned".to_string())?;
    db.list_repositories()
        .map_err(|error| error.to_string())?
        .into_iter()
        .map(|(id, name, local_path, remote_url, default_branch, author_filter_value)| {
            Ok(RepositoryRecord {
                id,
                name,
                local_path,
                remote_url,
                default_branch,
                author_filter_value,
            })
        })
        .collect()
}

#[tauri::command]
pub fn generate_report(
    state: State<AppState>,
    payload: GenerateReportPayload,
) -> Result<GenerateReportResult, String> {
    let mut db = state.database.lock().map_err(|_| "database lock poisoned".to_string())?;
    let (repo_name, local_path, default_branch, author_filter_value) = db
        .get_repository(&payload.repository_id)
        .map_err(|error| error.to_string())?;

    let mut commit_args = vec![
        "-C".to_string(),
        local_path.clone(),
        "log".to_string(),
        default_branch.clone(),
        "--since".to_string(),
        format!("{} 00:00:00", payload.report_date),
        "--until".to_string(),
        format!("{} 23:59:59", payload.report_date),
        "--pretty=format:%s".to_string(),
    ];
    if !author_filter_value.trim().is_empty() {
        commit_args.push("--author".to_string());
        commit_args.push(author_filter_value.clone());
    }

    let commits_output = Command::new("git")
        .args(commit_args.iter().map(String::as_str))
        .output()
        .map_err(|error| error.to_string())?;

    if !commits_output.status.success() {
        return Err(String::from_utf8_lossy(&commits_output.stderr).trim().to_string());
    }

    let commit_subjects = String::from_utf8_lossy(&commits_output.stdout)
        .lines()
        .filter(|line| !line.trim().is_empty())
        .map(|line| format!("- {line}"))
        .collect::<Vec<_>>();

    let body = if commit_subjects.is_empty() {
        "- No commits found in the selected date range".to_string()
    } else {
        commit_subjects.join("\n")
    };

    let content = format!(
        "# {} Daily Report\n\nRepository: {}\nBranch: {}\nAuthor Filter: {}\n\n## Completed Today\n{}\n",
        payload.report_date,
        repo_name,
        default_branch,
        if author_filter_value.trim().is_empty() {
            "None"
        } else {
            &author_filter_value
        },
        body
    );
    let reports_dir = state.app_data_dir.join("reports");
    fs::create_dir_all(&reports_dir).map_err(|error| error.to_string())?;
    let output_path = reports_dir.join(format!(
        "{}-{}.md",
        payload.repository_id, payload.report_date
    ));
    std::fs::write(&output_path, &content).map_err(|error| error.to_string())?;
    let output_path_string = output_path.to_string_lossy().to_string();

    db.save_report_run(
        &unique_id("run"),
        &payload.repository_id,
        &payload.report_date,
        &output_path_string,
        &content,
    )
    .map_err(|error| error.to_string())?;

    Ok(GenerateReportResult {
        output_path: output_path_string,
        content,
    })
}

#[tauri::command]
pub fn save_llm_provider(
    state: State<AppState>,
    payload: SaveLLMProviderPayload,
) -> Result<SaveResult, String> {
    let mut db = state.database.lock().map_err(|_| "database lock poisoned".to_string())?;
    let id = unique_id("llm");
    let secret_ref = format!("app://secret/{id}");
    save_secret_value(&state.app_data_dir, &secret_ref, &payload.api_key)?;
    db.save_llm_provider(
        &id,
        &payload.provider_name,
        &payload.base_url,
        &payload.model,
        &secret_ref,
        &mask_secret(&payload.api_key),
        "unverified",
        None,
    )
    .map_err(|error| error.to_string())?;

    Ok(SaveResult { id })
}

#[tauri::command]
pub fn list_llm_providers(state: State<AppState>) -> Result<Vec<LLMProviderRecord>, String> {
    let db = state.database.lock().map_err(|_| "database lock poisoned".to_string())?;
    db.list_llm_providers()
        .map_err(|error| error.to_string())?
        .into_iter()
        .map(
            |(
                id,
                provider_name,
                base_url,
                model,
                api_key_ref,
                api_key_mask,
                last_tested_at,
                test_status,
                is_active,
            )| {
                Ok(LLMProviderRecord {
                    id,
                    provider_name,
                    base_url,
                    model,
                    api_key_ref,
                    api_key_mask,
                    last_tested_at,
                    test_status,
                    is_active: is_active == 1,
                })
            },
        )
        .collect()
}

#[tauri::command]
pub fn set_active_llm_provider(
    state: State<AppState>,
    provider_id: String,
) -> Result<(), String> {
    let mut db = state.database.lock().map_err(|_| "database lock poisoned".to_string())?;
    db.set_active_llm_provider(&provider_id)
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn delete_llm_provider(
    state: State<AppState>,
    provider_id: String,
) -> Result<(), String> {
    let mut db = state.database.lock().map_err(|_| "database lock poisoned".to_string())?;
    db.delete_llm_provider(&provider_id)
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn test_llm_provider(payload: TestLLMProviderPayload) -> Result<AccountVerificationResult, String> {
    match post_chat_completion(
        &payload.base_url,
        &payload.api_key,
        &payload.model,
        "Reply with OK if the model is reachable.",
    ) {
        Ok(_) => Ok(AccountVerificationResult {
            status: "verified".into(),
            message: "连接测试成功".into(),
        }),
        Err(error) => Ok(AccountVerificationResult {
            status: "failed".into(),
            message: error,
        }),
    }
}

#[tauri::command]
pub fn fetch_llm_models(payload: TestLLMProviderPayload) -> Result<ProviderModelsResult, String> {
    let models = fetch_models(&payload.base_url, &payload.api_key)?;
    Ok(ProviderModelsResult { models })
}

#[tauri::command]
pub fn generate_llm_summary(
    state: State<AppState>,
    report_content: String,
) -> Result<String, String> {
    let db = state.database.lock().map_err(|_| "database lock poisoned".to_string())?;
    let providers = db
        .list_llm_providers()
        .map_err(|error| error.to_string())?;
    let provider = providers
        .into_iter()
        .find(|item| item.8 == 1)
        .or_else(|| db.list_llm_providers().ok()?.into_iter().next())
        .ok_or_else(|| "No LLM provider configured".to_string())?;
    let api_key = load_secret_value(&state.app_data_dir, &provider.4)?;
    drop(db);
    post_chat_completion(&provider.2, &api_key, &provider.3, &report_content)
}

#[tauri::command]
pub fn list_report_runs(state: State<AppState>) -> Result<Vec<ReportRunRecord>, String> {
    let db = state.database.lock().map_err(|_| "database lock poisoned".to_string())?;
    db.list_report_runs()
        .map_err(|error| error.to_string())?
        .into_iter()
        .map(|(id, repository_id, report_date, output_path, created_at)| {
            Ok(ReportRunRecord {
                id,
                repository_id,
                report_date,
                output_path,
                created_at,
            })
        })
        .collect()
}

pub fn build_app_state(app: &tauri::App) -> Result<AppState, String> {
    let app_data_dir = app
        .path()
        .app_local_data_dir()
        .map_err(|error| error.to_string())?;
    let secure_dir = app_data_dir.join("secure");
    fs::create_dir_all(&secure_dir).map_err(|error| error.to_string())?;
    let database = initialize_database_at_default_location(app).map_err(|error| error.to_string())?;
    Ok(AppState {
        database: Mutex::new(database),
        app_data_dir,
    })
}
