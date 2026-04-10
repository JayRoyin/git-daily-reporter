#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod db;

use tauri::Manager;

fn main() {
    let _ = db::database_directory();
    let _ = db::schema_sql();
    tauri::Builder::default()
        .setup(|app| {
            app.manage(commands::build_app_state(app)?);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::save_account,
            commands::verify_account,
            commands::read_git_identity,
            commands::save_credential,
            commands::discover_ssh_keys,
            commands::reveal_secret,
            commands::save_repository,
            commands::generate_report,
            commands::list_accounts,
            commands::list_credentials,
            commands::list_repositories,
            commands::save_llm_provider,
            commands::list_llm_providers,
            commands::generate_llm_summary,
            commands::test_llm_provider,
            commands::fetch_llm_models,
            commands::set_active_llm_provider,
            commands::delete_llm_provider,
            commands::list_report_runs
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
