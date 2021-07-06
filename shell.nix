{ pkgs, ... }:
pkgs.mkShell {
  buildInputs = with pkgs; [
    yarn
  ];
}
