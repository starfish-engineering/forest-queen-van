{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    nodejs_20
    nodePackages.npm
    nodePackages.typescript
    postgresql_15
    postgis
  ];

  shellHook = ''
    echo ""
    echo "🏗️  CapEx Scout Development Environment"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Node: $(node --version)"
    echo "npm: $(npm --version)"
    echo ""
    echo "Run 'docker-compose up -d' to start PostgreSQL"
    echo "Run 'npm run dev' to start the development server"
    echo ""
  '';
}

