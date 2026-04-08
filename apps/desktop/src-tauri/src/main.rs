#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod db;

use tauri::Manager;

fn main() {
    let _ = db::database_directory();
    let _ = db::schema_sql();
    tauri::Builder::default()
        .setup(|app| {
            let salt_path = app
                .path()
                .app_local_data_dir()
                .expect("could not resolve app local data path")
                .join("salt.txt");

            app.handle()
                .plugin(tauri_plugin_stronghold::Builder::with_argon2(&salt_path).build())?;

            app.manage(commands::build_app_state(app)?);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::save_account,
            commands::save_credential,
            commands::save_repository,
            commands::generate_report,
            commands::list_accounts,
            commands::list_credentials,
            commands::list_repositories,
            commands::save_llm_provider,
            commands::list_llm_providers,
            commands::generate_llm_summary,
            commands::set_active_llm_provider,
            commands::delete_llm_provider,
            commands::list_report_runs
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
