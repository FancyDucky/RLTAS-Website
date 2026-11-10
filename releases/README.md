# RLTAS plugin releases

This branch only holds plugin builds. Pushing a new `releases/version.txt` (with `releases/RLTAS.dll`) publishes a
GitHub Release through `.github/workflows/publish-plugin.yml`; players' plugins pick up the newest release.
