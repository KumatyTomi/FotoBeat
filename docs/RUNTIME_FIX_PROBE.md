# Runtime fix probe

This branch verifies the packaged Electron app after switching Vite to relative asset paths.

Expected result: the installed Windows app loads renderer assets from the packaged web directory instead of absolute asset paths.

Smoke check added for packaged web asset paths.
