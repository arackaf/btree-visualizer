This web app creates a BTree visualization from the configured data.

Look at App.tsx if you want to know where to start.

This app was built _largely_ with the help of AI, so please don't assume it's not without issues.

One known issue is that, if you put too many duplicate values in for one key, the leaf nodes (which only hold 3 elements max) may spill duplicate values into the neighboring leaf node, thereby violating core constraints for the BTree. So structure your data accordingly.

Real life BTrees have overflow space for leaf nodes, to avoid this, but obviously that was beyond the scope of this small project.
