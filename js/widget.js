var ACDH_VISUALIZATION = ACDH_VISUALIZATION || {};

ACDH_VISUALIZATION = {

	narrower_concepts: [],
	graph_data: {
		nodes: [],
		edges: [],
		types: {
			nodes: [{
					id: 't1',
					label: 'Category 1',
					color: '#5CC0C4'
				},
				{
					id: 't2',
					label: 'Category 2',
					color: '#88D8DF'
				}
			],
			edges: [{
				id: 'r1',
				label: 'Relation 1',
				color: '#990066'
			}]
		},
		replace: true
	},

	/* accessing graph data from page only possible starting from skosmos v.2 graph as JSON-LD 
	https://github.com/NatLibFi/Skosmos/wiki/Embedded-JSON-LD#requirements-and-definition */
	getNarrowerConcepts: function () {
		ACDH_VISUALIZATION.narrower_concepts.length = 0;
		console.log(ACDH_VISUALIZATION.narrower_concepts);
		var nclist = $("div.row:contains('NARROWER CONCEPTS')").find(".property-value-wrapper").find("ul li a");
		nclist.each(function (i, el) {
			var nConcept = {};
			nConcept = {
				"label": $.trim($(el).text()),
				"uri": $(el).attr("href")
			}
			ACDH_VISUALIZATION.narrower_concepts.push(nConcept);
		})
	},
	createNode(label,type) {
		var id = "n" + ACDH_VISUALIZATION.graph_data.nodes.length;
		return {
			"id": id,
			"label": label,
			"type": type
		};
	},
	createEdge(label, src, target) {
		var id = "e" + ACDH_VISUALIZATION.graph_data.edges.length;
		return {
			"id": id,
			"label": label,
			"source": src,
			"target": target,
			"type": "r1"
		};
	},
	emptyVisData: function () {
		ACDH_VISUALIZATION.graph_data.nodes.length = 0;
		ACDH_VISUALIZATION.graph_data.edges.length = 0;
	},
	createVisData: function (data) {
		var mainNode = ACDH_VISUALIZATION.createNode(data.prefLabels[0].label,"t1");
		ACDH_VISUALIZATION.graph_data.nodes.push(mainNode);
		ACDH_VISUALIZATION.narrower_concepts.forEach(function (nc, i) {
			ACDH_VISUALIZATION.graph_data.nodes.push(ACDH_VISUALIZATION.createNode(nc.label,"t2"))
			ACDH_VISUALIZATION.graph_data.edges.push(ACDH_VISUALIZATION.createEdge("skos:narrower", ACDH_VISUALIZATION.graph_data.nodes[0].id, ACDH_VISUALIZATION.graph_data.nodes[i + 1].id))
		})
		var graph = ACDH_VISUALIZATION.graph_data;

		ReactDOM.render(
			React.createElement(NetworkVisualization.SelectionControls, {
				graph
			}),
			document.getElementById('acdh_visualization')
		)

	},
	render: function (object) {
		$('.concept-info').after(Handlebars.compile($('#acdh_visualization-template').html())(object));
	}
};

$(function () {

	window.acdh_visualization = function (data) {
		if (data.prefLabels) {
			ACDH_VISUALIZATION.emptyVisData();
			ACDH_VISUALIZATION.render(data);
			ACDH_VISUALIZATION.getNarrowerConcepts();
			ACDH_VISUALIZATION.createVisData(data);
		}
	};
	$('#tree').on("select_node.jstree", function (e, data) {
		window.acdh_visualization(data);
	});
});