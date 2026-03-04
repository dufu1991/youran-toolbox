use serde::Deserialize;
use tauri::Manager;

#[derive(Deserialize, Default)]
#[serde(rename_all = "camelCase")]
struct WindowState {
  #[serde(default)]
  window_size_mode: String,
  #[serde(default)]
  window_width: u32,
  #[serde(default)]
  window_height: u32,
  #[serde(default)]
  window_x: i32,
  #[serde(default)]
  window_y: i32,
}

#[tauri::command]
fn save_window_state(app: tauri::AppHandle, state: String) -> Result<(), String> {
  let config_dir = app.path().app_config_dir().map_err(|e| e.to_string())?;
  std::fs::create_dir_all(&config_dir).map_err(|e| e.to_string())?;
  let file_path = config_dir.join("window-state.json");
  std::fs::write(file_path, state).map_err(|e| e.to_string())?;
  Ok(())
}

#[cfg(target_os = "macos")]
fn apply_window_effect(window: &tauri::WebviewWindow) {
  use tauri::window::{Effect, EffectState, EffectsBuilder};

  window
    .set_effects(
      EffectsBuilder::new()
        .effect(Effect::HudWindow)
        .state(EffectState::Active)
        .radius(10.0)
        .build(),
    )
    .unwrap_or_else(|error| eprintln!("Failed to apply macOS window effect: {}", error));
}

#[cfg(target_os = "windows")]
fn apply_window_effect(window: &tauri::WebviewWindow) {
  use tauri::window::{Effect, EffectsBuilder};

  window
    .set_effects(EffectsBuilder::new().effect(Effect::Acrylic).build())
    .unwrap_or_else(|error| eprintln!("Failed to apply Windows window effect: {}", error));
}

#[cfg(not(any(target_os = "macos", target_os = "windows")))]
fn apply_window_effect(_window: &tauri::WebviewWindow) {}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_clipboard_manager::init())
    .invoke_handler(tauri::generate_handler![save_window_state])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      if let Some(window) = app.get_webview_window("main") {
        // 在显示窗口前恢复尺寸和位置
        if let Ok(config_dir) = app.path().app_config_dir() {
          let state_file = config_dir.join("window-state.json");
          if let Ok(data) = std::fs::read_to_string(&state_file) {
            if let Ok(state) = serde_json::from_str::<WindowState>(&data) {
              if state.window_size_mode == "remember" {
                if state.window_width > 0 && state.window_height > 0 {
                  let _ = window
                    .set_size(tauri::PhysicalSize::new(state.window_width, state.window_height));
                }
                if state.window_x >= 0 && state.window_y >= 0 {
                  let _ = window
                    .set_position(tauri::PhysicalPosition::new(state.window_x, state.window_y));
                }
              }
            }
          }
        }

        apply_window_effect(&window);
        let _ = window.show();
      }

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
