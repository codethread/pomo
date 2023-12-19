const confile = "tauri/tauri.conf.json"

def main [--major] {
  let status = (git status --porcelain)

  if $status != "" {
    print "Unstaged work, commit it"
    exit 1
  }

  open $confile
    | update package.version { |p| 
      let v = ($p.package.version | parse "{maj}.{min}.{pat}" | first)

      if $major {
        $"(($v.maj | into int) + 1).($v.min).0" 
      } else {
        $"($v.maj).(($v.min | into int) + 1).0" 
      }
    }
    | save $confile -f

  ^$"($env.PWD)/node_modules/.bin/prettier" --write $confile

  let newV = open $confile | get package.version
  git add $confile
  git commit -m $"release v($newV)"
  git tag $"app-v($newV)"
  git push
  git push --tags
}
