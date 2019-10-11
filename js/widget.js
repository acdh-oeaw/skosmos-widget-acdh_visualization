var ACDH_VISUALIZATION = ACDH_VISUALIZATION || {};

ACDH_VISUALIZATION = {
	//json-ld data for this concept (includes narrower and broader concept)
	jsonldgraph: {},
	//filtered concept data from json-ld data for this concept
	currentconcept: {},
	//properties that should be visualized
	visprops: ["narrower","broader","topConceptOf","skos:exactMatch","skos:narrowMatch"],
	// properties, for which labels need to be plugged from graph
	enrichprops: ["narrower", "broader", "skos:topConceptOf"],
	graph_data: {
		nodes: [],
		edges: [],
		types: {
			nodes: [{
				id: 'concept',
				label: 'concept',
				color: '#5CC0C4'
			},
			{
				id: 'narrower',
				label: 'narrower',
				color: '#88D8DF'
			},
			{
				id:'broader',
				label:'broader',
				color:"#2C8891"
			},
			{
				id:'skos:narrowMatch',
				label:'skos:narrowMatch',
				color:"#ffcc33"
			},
			{
				id:'skos:exactMatch',
				label:'skos:narrowMatch',
				color:"#0047bb"
			}
			],
			edges: [{
				id: 'broader',
				label: 'broader',
				color: '#990066'
			}, {
				id: 'broaderTransitive',
				label: 'broaderTransitive',
				color: '#990066'
			}, {
				id: 'narrower',
				label: 'narrower',
				color: '#00748f'
			}, {
				id: 'related',
				label: 'related',
				color: '#FF9900'
			}]
		},
		replace: true
	},

	/* accessing graph data from page only possible starting from skosmos v.2 graph as JSON-LD 
	https://github.com/NatLibFi/Skosmos/wiki/Embedded-JSON-LD#requirements-and-definition */
	
	createNodeTypes: function() {
		ACDH_VISUALIZATION.visprops.forEach(function(visprop) {
			ACDH_VISUALIZATION
		})
	},
	
	getJSONLD: async function (vocab, uri, prop) {
		var url = "rest/v1/" + vocab + "/" + prop + "?uri=" + uri;
		var res = await fetch(url);
		var data = await res.json();
		return data;
	},
	getConceptData: async function (vocab, uri) {

		var res = await fetch("rest/v1/" + vocab + "/data?uri=" + uri + "&format=application/ld%2Bjson");
		var resdata = await res.json();

		ACDH_VISUALIZATION.jsonldgraph = resdata.graph;
		ACDH_VISUALIZATION.currentconcept = ACDH_VISUALIZATION.findConceptInGraph(uri);

	},

	enrichConceptData: function () {

		ACDH_VISUALIZATION.enrichprops.forEach(function (enrichprop) {

			if (ACDH_VISUALIZATION.currentconcept[enrichprop] instanceof Array) {
				ACDH_VISUALIZATION.currentconcept[enrichprop].forEach(function (concept) {

					var conceptforprop = ACDH_VISUALIZATION.findConceptInGraph(concept.uri);
					concept.label = ACDH_VISUALIZATION.getPrefLabelForLang(conceptforprop.prefLabel);
				})

			} else if (ACDH_VISUALIZATION.currentconcept[enrichprop] instanceof Object) {
				var conceptforprop = ACDH_VISUALIZATION.findConceptInGraph(ACDH_VISUALIZATION.currentconcept[enrichprop].uri);

				if (conceptforprop.prefLabel && conceptforprop.prefLabel.length > 0) {

					ACDH_VISUALIZATION.currentconcept[enrichprop].label = ACDH_VISUALIZATION.getPrefLabelForLang(conceptforprop.prefLabel);

				}
				else if (conceptforprop.label) {
					ACDH_VISUALIZATION.currentconcept[enrichprop].label = conceptforprop.label;
				}
			}
		});

	},
	findConceptInGraph: function (concepturi) {
		return ACDH_VISUALIZATION.jsonldgraph.filter(function (cobj) {
			return cobj.uri == concepturi;
		})[0];

	},
	getPrefLabelForLang: function (labels) {
		return labels.filter(function (label) {
			return label.lang == content_lang;
		})[0].value;
	},

	createNode(label, type) {
		var id = "n" + ACDH_VISUALIZATION.graph_data.nodes.length;
		return {
			"id": id,
			"label": label,
			"type": type
		};
	},
	createEdge(label, src, target, type) {
		var id = "e" + ACDH_VISUALIZATION.graph_data.edges.length;
		return {
			"id": id,
			"label": label,
			"source": src,
			"target": target,
			"type": type
		};
	},
	emptyVisData: function () {
		ACDH_VISUALIZATION.graph_data.nodes.length = 0;
		ACDH_VISUALIZATION.graph_data.edges.length = 0;
	},
	createVisData: function () {

		var mainNode = ACDH_VISUALIZATION.createNode(ACDH_VISUALIZATION.currentConcept.prefLabels[0].label, "concept");
		ACDH_VISUALIZATION.graph_data.nodes.push(mainNode);
		ACDH_VISUALIZATION.visprops.forEach(function(visprop) {
			if (ACDH_VISUALIZATION.currentconcept[visprop]) {
					if (ACDH_VISUALIZATION.currentconcept[visprop] instanceof Array) {
						ACDH_VISUALIZATION.currentconcept[visprop].forEach(function(obj) {
							var newNode = {};
							if (obj.label) {
								newNode = ACDH_VISUALIZATION.createNode(obj.label, visprop);
							} else {
								newNode = ACDH_VISUALIZATION.createNode(obj.uri, visprop);
							}
							ACDH_VISUALIZATION.graph_data.nodes.push(newNode);
							ACDH_VISUALIZATION.graph_data.edges.push(ACDH_VISUALIZATION.createEdge(visprop, ACDH_VISUALIZATION.graph_data.nodes[0].id, newNode.id, visprop));
						})
					}
					else if (ACDH_VISUALIZATION.currentconcept[visprop] instanceof Object) {
						var obj = ACDH_VISUALIZATION.currentconcept[visprop];
						var newNode = {};
						if (obj.label) {
							newNode = ACDH_VISUALIZATION.createNode(obj.label, visprop);
						} else {
							newNode = ACDH_VISUALIZATION.createNode(obj.uri, visprop);
						}
						ACDH_VISUALIZATION.graph_data.nodes.push(newNode);
						ACDH_VISUALIZATION.graph_data.edges.push(ACDH_VISUALIZATION.createEdge(visprop, ACDH_VISUALIZATION.graph_data.nodes[0].id, newNode.id, visprop));
					}
			}
			
		});
		var graph = ACDH_VISUALIZATION.graph_data;
		console.log(ACDH_VISUALIZATION.graph_data);
		ReactDOM.render(
			React.createElement(NetworkVisualization.SelectionControls, {
				graph
			}),
			$('#acdh_visualization .widget-body')[0]
		)

	},
	render: function (data) {
		$('.concept-info').after(Handlebars.compile($('#acdh_visualization-template').html())(data));
		ACDH_VISUALIZATION.currentConcept = data;
	}
};

$(function () {

	window.acdh_visualization = function (data) {
		if (data.prefLabels) {
			ACDH_VISUALIZATION.emptyVisData();
			ACDH_VISUALIZATION.render(data);
			ACDH_VISUALIZATION.getConceptData(vocab, data.uri).then(function () {
				ACDH_VISUALIZATION.enrichConceptData();
				ACDH_VISUALIZATION.createVisData();
			});
		};
	};
	$('#tree').on("select_node.jstree", function (e, data) {
		window.acdh_visualization(data);
	});
});