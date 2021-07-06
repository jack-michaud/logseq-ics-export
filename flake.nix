{
  description = "A very basic flake";

  outputs = { self, nixpkgs }: {

    packages.x86_64-linux.hello = nixpkgs.legacyPackages.x86_64-linux.hello;

    defaultPackage.x86_64-linux = self.packages.x86_64-linux.hello;

    devShell.x86_64-linux = let
      pkgs = import nixpkgs { system = "x86_64-linux"; };
    in
      import ./shell.nix { inherit pkgs; };

  };
}
