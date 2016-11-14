// check the node and all of its children
// returns true if the check function returns true for the node
// or any of its children, returns false otherwise
export default function recursiveNodeCheck(node, check) {
  if (check(node)) return true;
  for (let i = 0; i < node.children.length; i++) {
    if (recursiveNodeCheck(node.children[i], check)) return true;
  }
  return false;
}
