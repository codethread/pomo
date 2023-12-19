def main [] {
  (open tauri/tauri.conf.json 
  | update package.version { |p| 
    $p.package.version 
    | parse "{maj}.{min}.{pat}" | first 
    | $"($in.maj).(($in.min | into int) + 1).0" 
  }
  | save tauri/tauri.conf.json -f)
}
