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

impl Database {
    pub fn save_account(
        &mut self,
        id: &str,
        platform: &str,
        display_name: &str,
        git_username: &str,
        git_email: &str,
        default_auth_type: &str,
    ) -> rusqlite::Result<()> {
        let now = "2026-04-08T00:00:00Z";
        self.connection.execute(
            "INSERT OR REPLACE INTO accounts
            (id, platform, display_name, git_username, git_email, default_auth_type, created_at, updated_at)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, COALESCE((SELECT created_at FROM accounts WHERE id = ?1), ?7), ?7)",
            params![
                id,
                platform,
                display_name,
                git_username,
                git_email,
                default_auth_type,
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
        username_hint: &str,
    ) -> rusqlite::Result<()> {
        let now = "2026-04-08T00:00:00Z";
        self.connection.execute(
            "INSERT OR REPLACE INTO credentials
            (id, account_id, type, display_name, secret_ref, username_hint, last_verified_at, is_active, created_at, updated_at)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, NULL, 1, COALESCE((SELECT created_at FROM credentials WHERE id = ?1), ?7), ?7)",
            params![id, account_id, credential_type, display_name, secret_ref, username_hint, now],
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
        let now = "2026-04-08T00:00:00Z";
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
        let now = "2026-04-08T00:00:00Z";
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

    pub fn list_accounts(&self) -> rusqlite::Result<Vec<(String, String, String, String, String, String)>> {
        let mut statement = self.connection.prepare(
            "SELECT id, platform, display_name, git_username, git_email, default_auth_type
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
            ))
        })?;
        rows.collect()
    }

    pub fn list_credentials(&self) -> rusqlite::Result<Vec<(String, String, String, String, String)>> {
        let mut statement = self.connection.prepare(
            "SELECT id, account_id, type, display_name, username_hint
             FROM credentials ORDER BY updated_at DESC",
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

    pub fn list_repositories(&self) -> rusqlite::Result<Vec<(String, String, String, String, String, String)>> {
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
    ) -> rusqlite::Result<()> {
        let now = "2026-04-08T00:00:00Z";
        self.connection.execute(
            "INSERT OR REPLACE INTO llm_providers
            (id, provider_name, base_url, model, api_key_ref, is_active, created_at, updated_at)
            VALUES (?1, ?2, ?3, ?4, ?5, COALESCE((SELECT is_active FROM llm_providers WHERE id = ?1), 0), COALESCE((SELECT created_at FROM llm_providers WHERE id = ?1), ?6), ?6)",
            params![id, provider_name, base_url, model, api_key_ref, now],
        )?;
        Ok(())
    }

    pub fn list_llm_providers(&self) -> rusqlite::Result<Vec<(String, String, String, String, String, i64)>> {
        let mut statement = self.connection.prepare(
            "SELECT id, provider_name, base_url, model, api_key_ref, is_active FROM llm_providers ORDER BY updated_at DESC",
        )?;
        let rows = statement.query_map([], |row| {
            Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?, row.get(4)?, row.get(5)?))
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
    Ok(Database { connection })
}

pub fn initialize_database_at_default_location(app: &tauri::App) -> Result<Database, Box<dyn std::error::Error>> {
    let app_dir = app
        .path()
        .app_local_data_dir()
        .map_err(|error| -> Box<dyn std::error::Error> { Box::new(error) })?;
    let db_dir = app_dir.join(database_directory());
    fs::create_dir_all(&db_dir)?;
    let db_path = db_dir.join("app.sqlite");
    Ok(initialize_database(&db_path)?)
}

#[cfg(test)]
mod tests;
