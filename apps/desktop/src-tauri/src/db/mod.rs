use rusqlite::{params, Connection};
use std::fs;
use std::path::Path;
use tauri::Manager;

pub fn database_directory() -> &'static str {
    "db"
}

pub fn schema_sql() -> &'static str {
    include_str!("schema.sql")
}

pub struct Database {
    pub connection: Connection,
}

pub type AccountRow = (
    String,
    String,
    Option<String>,
    String,
    String,
    String,
    String,
    String,
    Option<String>,
    Option<String>,
);

pub type CredentialRow = (
    String,
    String,
    String,
    String,
    String,
    Option<String>,
    Option<String>,
    String,
    String,
);

pub type RepositoryRow = (String, String, String, String, String, String);

pub type ProviderRow = (
    String,
    String,
    String,
    String,
    String,
    String,
    Option<String>,
    String,
    i64,
);

impl Database {
    pub fn save_account(
        &mut self,
        id: &str,
        platform: &str,
        platform_base_url: Option<&str>,
        display_name: &str,
        git_username: &str,
        git_email: &str,
        default_auth_type: &str,
        verification_status: &str,
        verification_message: Option<&str>,
        last_verified_at: Option<&str>,
    ) -> rusqlite::Result<()> {
        let now = "2026-04-10T00:00:00Z";
        self.connection.execute(
            "INSERT OR REPLACE INTO accounts
            (id, platform, platform_base_url, display_name, git_username, git_email, default_auth_type, verification_status, verification_message, last_verified_at, created_at, updated_at)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, COALESCE((SELECT created_at FROM accounts WHERE id = ?1), ?11), ?11)",
            params![
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
                now
            ],
        )?;
        Ok(())
    }

    pub fn save_credential(
        &mut self,
        id: &str,
        account_id: &str,
        credential_type: &str,
        display_name: &str,
        secret_ref: &str,
        secret_mask: &str,
        source_path: Option<&str>,
        username_hint: &str,
        verification_status: &str,
    ) -> rusqlite::Result<()> {
        let now = "2026-04-10T00:00:00Z";
        self.connection.execute(
            "INSERT OR REPLACE INTO credentials
            (id, account_id, type, display_name, secret_ref, secret_mask, source_path, username_hint, last_verified_at, verification_status, is_active, created_at, updated_at)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, NULL, ?9, 1, COALESCE((SELECT created_at FROM credentials WHERE id = ?1), ?10), ?10)",
            params![
                id,
                account_id,
                credential_type,
                display_name,
                secret_ref,
                secret_mask,
                source_path,
                username_hint,
                verification_status,
                now
            ],
        )?;
        Ok(())
    }

    pub fn save_repository(
        &mut self,
        id: &str,
        name: &str,
        local_path: &str,
        remote_url: &str,
        default_branch: &str,
        account_id: &str,
        credential_id: &str,
        author_filter_value: &str,
    ) -> rusqlite::Result<()> {
        let now = "2026-04-10T00:00:00Z";
        self.connection.execute(
            "INSERT OR REPLACE INTO repositories
            (id, name, local_path, remote_url, default_branch, account_id, credential_id, author_filter_mode, author_filter_value, created_at, updated_at)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 'account_email', ?8, COALESCE((SELECT created_at FROM repositories WHERE id = ?1), ?9), ?9)",
            params![id, name, local_path, remote_url, default_branch, account_id, credential_id, author_filter_value, now],
        )?;
        Ok(())
    }

    pub fn save_report_run(
        &mut self,
        id: &str,
        repository_id: &str,
        report_date: &str,
        output_path: &str,
        content: &str,
    ) -> rusqlite::Result<()> {
        let now = "2026-04-10T00:00:00Z";
        self.connection.execute(
            "INSERT OR REPLACE INTO report_runs
            (id, repository_id, report_date, output_path, content, created_at)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![id, repository_id, report_date, output_path, content, now],
        )?;
        Ok(())
    }

    pub fn get_repository(&self, id: &str) -> rusqlite::Result<(String, String, String, String)> {
        self.connection.query_row(
            "SELECT name, local_path, default_branch, author_filter_value FROM repositories WHERE id = ?1",
            params![id],
            |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?)),
        )
    }

    pub fn list_accounts(&self) -> rusqlite::Result<Vec<AccountRow>> {
        let mut statement = self.connection.prepare(
            "SELECT id, platform, platform_base_url, display_name, git_username, git_email, default_auth_type, verification_status, verification_message, last_verified_at
             FROM accounts ORDER BY updated_at DESC",
        )?;
        let rows = statement.query_map([], |row| {
            Ok((
                row.get(0)?,
                row.get(1)?,
                row.get(2)?,
                row.get(3)?,
                row.get(4)?,
                row.get(5)?,
                row.get(6)?,
                row.get(7)?,
                row.get(8)?,
                row.get(9)?,
            ))
        })?;
        rows.collect()
    }

    pub fn list_credentials(&self) -> rusqlite::Result<Vec<CredentialRow>> {
        let mut statement = self.connection.prepare(
            "SELECT id, account_id, type, display_name, secret_ref, source_path, username_hint, secret_mask, verification_status
             FROM credentials ORDER BY updated_at DESC",
        )?;
        let rows = statement.query_map([], |row| {
            Ok((
                row.get(0)?,
                row.get(1)?,
                row.get(2)?,
                row.get(3)?,
                row.get(4)?,
                row.get(5)?,
                row.get(6)?,
                row.get(7)?,
                row.get(8)?,
            ))
        })?;
        rows.collect()
    }

    pub fn list_repositories(&self) -> rusqlite::Result<Vec<RepositoryRow>> {
        let mut statement = self.connection.prepare(
            "SELECT id, name, local_path, remote_url, default_branch, author_filter_value
             FROM repositories ORDER BY updated_at DESC",
        )?;
        let rows = statement.query_map([], |row| {
            Ok((
                row.get(0)?,
                row.get(1)?,
                row.get(2)?,
                row.get(3)?,
                row.get(4)?,
                row.get(5)?,
            ))
        })?;
        rows.collect()
    }

    pub fn save_llm_provider(
        &mut self,
        id: &str,
        provider_name: &str,
        base_url: &str,
        model: &str,
        api_key_ref: &str,
        api_key_mask: &str,
        test_status: &str,
        last_tested_at: Option<&str>,
    ) -> rusqlite::Result<()> {
        let now = "2026-04-10T00:00:00Z";
        self.connection.execute(
            "INSERT OR REPLACE INTO llm_providers
            (id, provider_name, base_url, model, api_key_ref, api_key_mask, last_tested_at, test_status, is_active, created_at, updated_at)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, COALESCE((SELECT is_active FROM llm_providers WHERE id = ?1), 0), COALESCE((SELECT created_at FROM llm_providers WHERE id = ?1), ?9), ?9)",
            params![
                id,
                provider_name,
                base_url,
                model,
                api_key_ref,
                api_key_mask,
                last_tested_at,
                test_status,
                now
            ],
        )?;
        Ok(())
    }

    pub fn list_llm_providers(&self) -> rusqlite::Result<Vec<ProviderRow>> {
        let mut statement = self.connection.prepare(
            "SELECT id, provider_name, base_url, model, api_key_ref, api_key_mask, last_tested_at, test_status, is_active FROM llm_providers ORDER BY updated_at DESC",
        )?;
        let rows = statement.query_map([], |row| {
            Ok((
                row.get(0)?,
                row.get(1)?,
                row.get(2)?,
                row.get(3)?,
                row.get(4)?,
                row.get(5)?,
                row.get(6)?,
                row.get(7)?,
                row.get(8)?,
            ))
        })?;
        rows.collect()
    }

    pub fn set_active_llm_provider(&mut self, id: &str) -> rusqlite::Result<()> {
        self.connection.execute("UPDATE llm_providers SET is_active = 0", [])?;
        self.connection.execute(
            "UPDATE llm_providers SET is_active = 1 WHERE id = ?1",
            params![id],
        )?;
        Ok(())
    }

    pub fn delete_llm_provider(&mut self, id: &str) -> rusqlite::Result<()> {
        self.connection
            .execute("DELETE FROM llm_providers WHERE id = ?1", params![id])?;
        Ok(())
    }

    pub fn list_report_runs(&self) -> rusqlite::Result<Vec<(String, String, String, String, String)>> {
        let mut statement = self.connection.prepare(
            "SELECT id, repository_id, report_date, output_path, created_at
             FROM report_runs ORDER BY created_at DESC",
        )?;
        let rows = statement.query_map([], |row| {
            Ok((
                row.get(0)?,
                row.get(1)?,
                row.get(2)?,
                row.get(3)?,
                row.get(4)?,
            ))
        })?;
        rows.collect()
    }
}

pub fn initialize_database(path: &Path) -> rusqlite::Result<Database> {
    let connection = Connection::open(path)?;
    connection.execute_batch(schema_sql())?;
    let database = Database { connection };
    database.apply_migrations()?;
    Ok(database)
}

pub fn initialize_database_at_default_location(
    app: &tauri::App,
) -> Result<Database, Box<dyn std::error::Error>> {
    let app_dir = app
        .path()
        .app_local_data_dir()
        .map_err(|error| -> Box<dyn std::error::Error> { Box::new(error) })?;
    let db_dir = app_dir.join(database_directory());
    fs::create_dir_all(&db_dir)?;
    let db_path = db_dir.join("app.sqlite");
    Ok(initialize_database(&db_path)?)
}

impl Database {
    fn apply_migrations(&self) -> rusqlite::Result<()> {
        fn add_column_if_missing(
            connection: &Connection,
            table: &str,
            column: &str,
            ddl: &str,
        ) -> rusqlite::Result<()> {
            let mut statement = connection.prepare(&format!("PRAGMA table_info({table})"))?;
            let rows = statement.query_map([], |row| row.get::<_, String>(1))?;
            let columns = rows.collect::<rusqlite::Result<Vec<_>>>()?;
            if !columns.iter().any(|item| item == column) {
                connection.execute(ddl, [])?;
            }
            Ok(())
        }

        add_column_if_missing(
            &self.connection,
            "accounts",
            "platform_base_url",
            "ALTER TABLE accounts ADD COLUMN platform_base_url TEXT",
        )?;
        add_column_if_missing(
            &self.connection,
            "accounts",
            "verification_status",
            "ALTER TABLE accounts ADD COLUMN verification_status TEXT NOT NULL DEFAULT 'unverified'",
        )?;
        add_column_if_missing(
            &self.connection,
            "accounts",
            "verification_message",
            "ALTER TABLE accounts ADD COLUMN verification_message TEXT",
        )?;
        add_column_if_missing(
            &self.connection,
            "accounts",
            "last_verified_at",
            "ALTER TABLE accounts ADD COLUMN last_verified_at TEXT",
        )?;

        add_column_if_missing(
            &self.connection,
            "credentials",
            "secret_mask",
            "ALTER TABLE credentials ADD COLUMN secret_mask TEXT NOT NULL DEFAULT ''",
        )?;
        add_column_if_missing(
            &self.connection,
            "credentials",
            "source_path",
            "ALTER TABLE credentials ADD COLUMN source_path TEXT",
        )?;
        add_column_if_missing(
            &self.connection,
            "credentials",
            "verification_status",
            "ALTER TABLE credentials ADD COLUMN verification_status TEXT NOT NULL DEFAULT 'unverified'",
        )?;

        add_column_if_missing(
            &self.connection,
            "llm_providers",
            "api_key_mask",
            "ALTER TABLE llm_providers ADD COLUMN api_key_mask TEXT NOT NULL DEFAULT ''",
        )?;
        add_column_if_missing(
            &self.connection,
            "llm_providers",
            "last_tested_at",
            "ALTER TABLE llm_providers ADD COLUMN last_tested_at TEXT",
        )?;
        add_column_if_missing(
            &self.connection,
            "llm_providers",
            "test_status",
            "ALTER TABLE llm_providers ADD COLUMN test_status TEXT NOT NULL DEFAULT 'unverified'",
        )?;

        Ok(())
    }
}

#[cfg(test)]
mod tests;
