{
  description = "Frontal Cloud JavaScript/TypeScript SDK Monorepo";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    bun.url = "github:oven-sh/bun";
  };

  outputs = { self, nixpkgs, flake-utils, bun }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        bun-pkg = bun.packages.${system}.bun;
        
        # Development dependencies
        devDeps = with pkgs; [
          nodejs_20
          bun-pkg
          git
          biome
          typescript
        ];

        # Shell environment
        devShell = pkgs.mkShell {
          buildInputs = devDeps;
          
          shellHook = ''
            echo "🚀 Frontal Cloud SDK Development Environment"
            echo "Node: $(node --version)"
            echo "Bun: $(bun --version)"
            echo "TypeScript: $(tsc --version)"
            echo ""
            echo "Available commands:"
            echo "  bun run build     - Build all packages"
            echo "  bun run test      - Run tests"
            echo "  bun run lint      - Lint code"
            echo "  bun run format    - Format code"
            echo "  bun run changeset - Add changeset"
          '';
        };
      in
      {
        devShells.default = devShell;
        
        # Package the SDK
        packages = {
          default = pkgs.stdenv.mkDerivation {
            pname = "frontal-cloud-sdk";
            version = "0.0.0";
            src = ./.;
            
            nativeBuildInputs = with pkgs; [ bun-pkg ];
            
            buildPhase = ''
              bun install --frozen-lockfile
              bun run build
            '';
            
            installPhase = ''
              mkdir -p $out
              cp -r packages/*/dist $out/
            '';
          };
        };
      });
}
