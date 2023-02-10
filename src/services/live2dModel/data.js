import { isMocFile, isSettingsFile } from "./helpers";

const __SOURCE_REPOSITORIES__ = [];

// export interface TreeNode {
//     id: number;
//     name: string;
//     children?: TreeNode[];
//     files?: string[];
//     error?: any;
//     modelCount: number;
// }

let uid = 0;

const JSDELIVR_PREFIX = "https://cdn.jsdelivr.net/gh/";

const tasks = new Map();

const rootNodes = __SOURCE_REPOSITORIES__.map((repo) => ({
  // eslint-disable-next-line
  id: uid++,
  name: repo,
  children: [],
  files: [],
  modelCount: 0,
}));

const settingsJSONs = {};

// preload
rootNodes.forEach(loadRootNode);

export function getRootNodes() {
  return rootNodes;
}

export function loadRootNode(node) {
  if (!rootNodes.includes(node)) {
    return Promise.resolve();
  }

  if (!tasks.get(node)) {
    const task = fetch(node.name.toLowerCase().replace("/", "") + ".json")
      .then((res) => res.json())
      .then((data) => {
        node.name = data.models.name;
        node.children = data.models.children;
        node.files = data.models.files;

        // eslint-disable-next-line
        traverseNode(node, (n) => (n.id = uid++));
        countModels(node);

        Object.assign(settingsJSONs, data.settings);
      })
      .catch((e) => (node.error = e));

    tasks.set(node, task);

    return task;
  }

  return tasks.get(node);
}

function countModels(node) {
  node.modelCount = node.files?.length || 0;

  for (const child of node.children || []) {
    node.modelCount += countModels(child);
  }

  return node.modelCount;
}

export function traverseNode(node, fn) {
  fn(node);

  if (node.children) {
    for (const child of node.children) {
      traverseNode(child, fn);
    }
  }
}

export function getFileURL(folder, file) {
  const folderPath = getNodePath(folder);

  if (folderPath) {
    let filePath = encodeURI(folderPath + "/" + file);

    return JSDELIVR_PREFIX + filePath;
  }
}

/**
 * Converts the jsDelivr URL to GitHub's raw URL.
 *
 * - `https://cdn.jsdelivr.net/gh/<repo>/<file>`
 * - `https://raw.githubusercontent.com/<repo>/master/<file>`
 */
export function getAlternativeURL(url) {
  const repoAndFile = url.replace(JSDELIVR_PREFIX, "");
  const names = repoAndFile.split("/");
  const repo = names.slice(0, 2).join("/");
  const file = names.slice(2).join("/");

  return `https://raw.githubusercontent.com/${repo}/master/${file}`;
}

export function getNodePath(node) {
  const search = (nodes) => {
    for (const _node of nodes) {
      if (_node === node) {
        return _node.name;
      }

      if (_node.children) {
        const subPath = search(_node.children);

        if (subPath) {
          return _node.name + "/" + subPath;
        }
      }
    }
  };

  return search(rootNodes);
}

export function validateURL(url) {
  if (isSettingsFile(url) || url.endsWith(".zip")) {
    return;
  }

  if (isMocFile(url)) {
    if (getSettingsJSON(url)) {
      return;
    }

    return "Error: Cannot display a moc file that doesn't belong to any source repository";
  }

  return "Warning: Unknown URL type. The model may not be loaded correctly";
}

export function getSettingsJSON(mocURL) {
  if (mocURL.startsWith(JSDELIVR_PREFIX)) {
    let mocFile = mocURL.replace(JSDELIVR_PREFIX, "");

    mocFile = decodeURI(mocFile);

    return settingsJSONs[mocFile];
  }
}
