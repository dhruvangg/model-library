export const getTreeData = (hwv) => {
    const level = 0;
    const model = hwv.model;
    const rootNodeId = model.getAbsoluteRootNode();
    const arrayData = [];
    const pmiData = [];
    const pmi = hwv.model.getPmis();
    if (pmi) {
        Object.keys(pmi).forEach(nodeId => {
            pmiData.push(Number(nodeId));
        });
    }

    const getNodeData = (mod, nodeId, lev) => {
        const children = mod.getNodeChildren(nodeId);
        const node = {
            level: lev,
            nodeId,
            key: nodeId,
            isActive: false,
            isSelected: false,
            name: mod.getNodeName(nodeId)
        };
        arrayData.push(node.nodeId);
        return {
            ...node,
            children: children.length ? children.map((childNodeId) => getNodeData(model, childNodeId, lev + 1)) : [],
        };
    };
    const treeData = getNodeData(model, rootNodeId, level);
    return [treeData, arrayData, pmiData];
};