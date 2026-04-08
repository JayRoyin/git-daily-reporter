use crate::db::{initialize_database_at_default_location, Database};
use serde::{Deserialize, Serialize};
use std::process::Command;
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::State;

pub struct AppState {
    pub database: Mutex<Database>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveAccountPayload {
    pub display_name: String,
    pub git_username: String,
    pub git_email: String,
    pub default_auth_type: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveCredentialPayload {
    pub account_id: String,
    pub display_name: String,
    pub credential_type: String,
    pub username_hint: String,
    pub secret_ref: String,
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
    pub api_key_ref: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AccountRecord {
    pub id: String,
    pub platform: String,
    pub display_name: String,
    pub git_username: String,
    pub git_email: String,
    pub default_auth_type: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveResult {
    pub id: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CredentialRecord {
    pub id: String,
    pub account_id: String,
    pub r#type: String,
    pub display_name: String,
    pub username_hint: String,
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
    pub is_active: bool,
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
        "github",
        &payload.display_name,
        &payload.git_username,
        &payload.git_email,
        &payload.default_auth_type,
    )
    .map_err(|error| error.to_string())?;

    Ok(AccountRecord {
        id,
        platform: "github".into(),
        display_name: payload.display_name,
        git_username: payload.git_username,
        git_email: payload.git_email,
        default_auth_type: payload.default_auth_type,
    })
}

#[tauri::command]
pub fn save_credential(
    state: State<AppState>,
    payload: SaveCredentialPayload,
) -> Result<SaveResult, String> {
    let mut db = state.database.lock().map_err(|_| "database lock poisoned".to_string())?;
    let id = unique_id("cred");
    db.save_credential(
        &id,
        &payload.account_id,
        &payload.credential_type,
        &payload.display_name,
        &payload.secret_ref,
        &payload.username_hint,
    )
    .map_err(|error| error.to_string())?;

    Ok(SaveResult { id })
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

    let mut numstat_args = vec![
        "-C".to_string(),
        local_path.clone(),
        "log".to_string(),
        default_branch.clone(),
        "--since".to_string(),
        format!("{} 00:00:00", payload.report_date),
        "--until".to_string(),
        format!("{} 23:59:59", payload.report_date),
        "--numstat".to_string(),
        "--format=".to_string(),
    ];
    if !author_filter_value.trim().is_empty() {
        numstat_args.push("--author".to_string());
        numstat_args.push(author_filter_value.clone());
    }

    let numstat_output = Command::new("git")
        .args(numstat_args.iter().map(String::as_str))
        .output()
        .map_err(|error| error.to_string())?;
    if !numstat_output.status.success() {
        return Err(String::from_utf8_lossy(&numstat_output.stderr).trim().to_string());
    }

    let file_lines = String::from_utf8_lossy(&numstat_output.stdout)
        .lines()
        .filter_map(|line| {
            let parts = line.split('\t').collect::<Vec<_>>();
            if parts.len() != 3 {
                return None;
            }
            Some(format!("- {} (+{} / -{})", parts[2], parts[0], parts[1]))
        })
        .collect::<Vec<_>>();

    let files_section = if file_lines.is_empty() {
        "- No file stats found".to_string()
    } else {
        file_lines.join("\n")
    };

    let content = format!(
        "# {} Daily Report\n\nRepository: {}\nBranch: {}\nAuthor Filter: {}\n\n## Completed Today\n{}\n\n## File Stats\n{}\n",
        payload.report_date,
        repo_name,
        default_branch,
        if author_filter_value.trim().is_empty() { "None" } else { &author_filter_value },
        body,
        files_section
    );
    let output_path = format!("/tmp/{}-{}.md", payload.repository_id, payload.report_date);
    std::fs::write(&output_path, &content).map_err(|error| error.to_string())?;

    db.save_report_run(
        "run-local-1",
        &payload.repository_id,
        &payload.report_date,
        &output_path,
        &content,
    )
    .map_err(|error| error.to_string())?;

    Ok(GenerateReportResult { output_path, content })
}

#[tauri::command]
pub fn list_accounts(state: State<AppState>) -> Result<Vec<AccountRecord>, String> {
    let db = state.database.lock().map_err(|_| "database lock poisoned".to_string())?;
    db.list_accounts()
        .map_err(|error| error.to_string())?
        .into_iter()
        .map(
            |(id, platform, display_name, git_username, git_email, default_auth_type)| {
                Ok(AccountRecord {
                    id,
                    platform,
                    display_name,
                    git_username,
                    git_email,
                    default_auth_type,
                })
            },
        )
        .collect()
}

#[tauri::command]
pub fn list_credentials(state: State<AppState>) -> Result<Vec<CredentialRecord>, String> {
    let db = state.database.lock().map_err(|_| "database lock poisoned".to_string())?;
    db.list_credentials()
        .map_err(|error| error.to_string())?
        .into_iter()
        .map(|(id, account_id, credential_type, display_name, username_hint)| {
            Ok(CredentialRecord {
                id,
                account_id,
                r#type: credential_type,
                display_name,
                username_hint,
            })
        })
        .collect()
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
pub fn save_llm_provider(
    state: State<AppState>,
    payload: SaveLLMProviderPayload,
) -> Result<SaveResult, String> {
    let mut db = state.database.lock().map_err(|_| "database lock poisoned".to_string())?;
    let id = unique_id("llm");
    db.save_llm_provider(
        &id,
        &payload.provider_name,
        &payload.base_url,
        &payload.model,
        &payload.api_key_ref,
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
        .map(|(id, provider_name, base_url, model, api_key_ref, is_active)| {
            Ok(LLMProviderRecord {
                id,
                provider_name,
                base_url,
                model,
                api_key_ref,
                is_active: is_active == 1,
            })
        })
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

#[tauri::command]
pub fn generate_llm_summary(report_content: String) -> Result<String, String> {
    let trimmed = report_content.lines().take(8).collect::<Vec<_>>().join("\n");
    Ok(format!(
        "AI Summary:\n{}\n\nThis is the current LLM integration scaffold. The next step is calling the user-configured provider endpoint with the saved model config.",
        trimmed
    ))
}

pub fn build_app_state(app: &tauri::App) -> Result<AppState, String> {
    let database = initialize_database_at_default_location(app).map_err(|error| error.to_string())?;
    Ok(AppState {
        database: Mutex::new(database),
    })
}

fn unique_id(prefix: &str) -> String {
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("time went backwards")
        .as_nanos();
    format!("{prefix}-{nanos}")
}
