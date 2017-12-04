#r "packages/FAKE/tools/FakeLib.dll" // include Fake lib
open Fake

let buildMode = getBuildParamOrDefault "buildMode" "Release"
let setParams defaults =
        { defaults with
            Verbosity = Some(Quiet)
            Targets = ["Build"]
            Properties =
                [
                    "Optimize", "True"
                    "DebugSymbols", "True"
                    "Configuration", buildMode
                ]
         }
build setParams "./bloom-filter.sln"
      |> DoNothing