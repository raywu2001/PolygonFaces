//Algorithm 1: find interior faces of a polygon
//Input: json_data -- vertices and edges
//Output: facemap -- key: face id, value: array of vertex id of the face
function FindFaces(json_data) { 

   //alert(0);
   
   //Computational complexity is E*V
   //E: number of edges
   //V: number of vertices
	
	var vertices = json_data.vertices;
	var edges = json_data.edges;
	
	var numVertices = Object.keys(vertices).length;
	var numEdges = Object.keys(edges).length;
	
	//edge index set
	var eSet = new Set(); 
	
	// vertex to connected vertex set map
	// Key: vertex index
	// Value: set of vertices that connect to the key vertex
	var vmap = new Map();
	
	// vertex to edge set map
	// Key: vertex index
	// Value: set of edges that has the key vertex
	var v2emap = new Map();
	
	var startIndex;
	var endIndex;
	for (var i = 0; i < numEdges; i++) {
		 startIndex = edges[i][0];
		 endIndex = edges[i][1];
		 
		 var connectedEndV = vmap.get(startIndex);
		 if (connectedEndV == null)
		 {  connectedEndV = new Set();
		 }
		 connectedEndV.add(endIndex);
		 vmap.set(startIndex, connectedEndV);
		 
		 var connectedStartV = vmap.get(endIndex);
		 if (connectedStartV == null)
		 {  connectedStartV = new Set();
		 }
		 connectedStartV.add(startIndex);
		 vmap.set(endIndex, connectedStartV);
		 
		 var edges1 = v2emap.get(startIndex);
		 if (edges1 == null)
		 {  edges1 = new Set();
		 }
		 edges1.add(i);
		 v2emap.set(startIndex, edges1);
		 
		 var edges2 = v2emap.get(endIndex);
		 if (edges2 == null)
		 {  edges2 = new Set();
		 }
		 edges2.add(i);
		 v2emap.set(endIndex, edges2);
		 
		 eSet.add(i);
    }

     //faceMap
	 // Key: face number id
	// Value: set of vertices that makes the face
     var faceMap = new Map();
	  
	 var faceNum = 0;
	 
	 //Loop through the edge set until it is empty
     while (eSet.size != 0)
	 {
	     var startVInd;
		 var endVInd;
		 
		 var verNum = 0;
		 
		 // Get first edge's start and end vertex indices
		 const [first] = eSet;
		 var edgeInd = first;
				
		 startVInd = edges[edgeInd][0];
		 endVInd = edges[edgeInd][1];
		 
		 var faceStartVertex = startVInd;
		 
		 var faceVertices = new Array();
		 faceVertices = [];
		 faceVertices[verNum++] = startVInd;
		 faceVertices[verNum++] = endVInd;
		 
		 //Start Loop and find face and its edges
		 do
		 {
			 //Get the vector of the starting edge
			 var xa = vertices[startVInd][0] - vertices[endVInd][0];
			 var ya = vertices[startVInd][1] - vertices[endVInd][1];
			 var minAngle = 6.28;
			 var minIndex = 0;
			
			 // Given the end vertex, gets those vertices that connects to this vertex
			 var connectedEndV = vmap.get(endVInd);
			 
			 // flag to indicate sign is set or not
			var bSignSet = false;
			var bSameSide = false;
					 
			 for (const element of connectedEndV) {
				 var vIndex = element;
				 
				 if (vIndex != startVInd) 
				 {
					 //Get the vector of the next connected edge
					 var xb = vertices[vIndex][0] - vertices[endVInd][0];
					 var yb = vertices[vIndex][1] - vertices[endVInd][1];
					 
					 //Calculate the angle between the two vectors
					 var v1 = Math.sqrt(xa* xa + ya*ya) * Math.sqrt(xb*xb + yb*yb);
					 var v2 = (xa * xb + ya * yb);
					 var v3 = v2/v1;
					 var angle = Math.acos(v3);
					 
					 var x = vertices[vIndex][0];
					 var y = vertices[vIndex][1];
					 var x1 = vertices[startVInd][0];
					 var y1 = vertices[startVInd][1];
					 var x2 = vertices[endVInd][0];
					 var y2 = vertices[endVInd][1];
					 
					 bSameSide = false;
					 var dx1 = x - x1;
					 var dy1 = y - y1;
					 var dx2 = x2 - x1;
					 var dy2 = y2 - y1;
					 
					 // use dot product to check side of the point
					 var areaV1 = dx1 * dy2 - dy1 * dx2; 
					
					// if the face already has more than two vertices, verify if the newly selected vertex 
					// and the vertex selected before this edge are located on the same side of current edge
					if (faceVertices.length > 2)
					{
						 var lastVInd = faceVertices[faceVertices.length - 3];
						 x = vertices[lastVInd][0];
						 y = vertices[lastVInd][1];
						 dx1 = x - x1;
						 dy1 = y - y1;
						 var areaV2 = dx1 * dy2 - dy1 * dx2; 
					     
                         if((areaV1 > 0 && areaV2 > 0) || (areaV1 < 0 && areaV2 < 0))
						 {
							 bSameSide = true;
						 }
						 else
						 {
							  bSameSide = false;
						 }
						 
						 bSignSet = true;
						 
					}
					
					// select the vertex/edge with minimum angle and same side with previously selected vertex
					if (angle < minAngle && (bSameSide == 1 || bSignSet == false))
					{
						minAngle = angle;
						minIndex = vIndex;
					}
					 
				}
			
			}
			
			faceVertices[verNum++] = minIndex;
			
			startVInd = endVInd;
			endVInd = minIndex;
		} while (faceStartVertex != endVInd);
	    
		//If a vertex has only two connected edges and both of them belong to this same face,
		// remove them from future searching
		var vertexWithTwoConnectedEdges = new Set();
		for (var i= 0; i< faceVertices.length -1; i++)
		{
		     //Get the vertex index 
		    var vi = faceVertices[i];
			
		    //Edge numbers for a given vertex. if it is 2, remove it for next search
			var connEdges = vmap.get(vi);
		    if (connEdges.size == 2)
			{
			  vertexWithTwoConnectedEdges.add(i);
			}
			else 
			{
			   continue;
			}
		}
		
		// iterate through the set and remove edges/vertices from future searching
		for (const element of vertexWithTwoConnectedEdges)
		{
			var i = element;
	        var vi = faceVertices[i];
	        
			var lastV;
			if (i == 0)
	          lastV = faceVertices[faceVertices.length -2];
		    else
			   lastV = faceVertices[i-1];
			
		    var nextV;
            if (i+1 >= faceVertices.length)
                nextV = faceVertices[1];
			else
				nextV = faceVertices[i+1];
			
			//Remove edges from future searching
			if (v2emap.has(vi))
			{
				var edgeSet = v2emap.get(vi);
				
				for (const j of edgeSet)
				{
					var sIndex = edges[j][0];
					var eIndex = edges[j][1];
					
					var bDelete = 0;
					
					//delete edge from eSet that is used for next iteration
					if ((sIndex == lastV && eIndex == vi) || (sIndex == vi && eIndex == lastV))
					{
					   eSet.delete(j);	
					   bDelete = 1;
					}
					   
					if ((sIndex == nextV && eIndex == vi) || (sIndex == vi && eIndex == nextV))
					{
					   eSet.delete(j);
					   bDelete = 1;
					}
					
					if (bDelete == 1)
					{
						//delete end vertex of the deleted edge from connectedEndV of vMap
						var connectedV = vmap.get(sIndex);
						if(connectedV.has(eIndex))
						{
								connectedV.delete(eIndex);
								vmap.set(sIndex, connectedV);
						}
						//delete start vertex of the delete edge from connectedEndV of vMap
						var connectedV = vmap.get(eIndex);
						if(connectedV.has(sIndex))
						{
							connectedV.delete(sIndex);
							vmap.set(eIndex, connectedV);
						}
					}
				}
			}

		}
	
		 faceMap.set(faceNum, faceVertices);
		 
		 faceNum = faceNum + 1;
	 }
	 
	 //const obj = Object.fromEntries(faceMap);
	 //const myJSON = JSON.stringify(faceMap);
	 //alert(myJSON);
	 
	 return faceMap;
}

//Algorithm 2: find neighboring faces of a face
//Input: faceid -- identifier of the face
//       facemap -- key: face id, value: array of vertex id of the face
//Output: array of neighboring faces
function findNeighorFaces(faceid, faceMap) { 

   //Computational complexity is V * F
   //V: number of vertices of the input face
   //F: number of given faces
   
	 var neighborFaces = new Array();
	 
	 var faceVertices = faceMap.get(faceid);
	 
     var num = 0;	 
	 for (var i= 0; i< faceVertices.length -1; i++)
	 {
		 //Get the start vertex index 
		var vs = faceVertices[i];
		
		//Get the end vertex index 
		var ve = faceVertices[i+1];
	   
	   for (let [key, value] of faceMap) {

			if (key == faceid)
				continue;
			
			const b1 = value.includes(vs);
			const b2 = value.includes(ve);
			if (b1 == true && b2 == true)
			{
				neighborFaces[num++] = key;
				
				break;
			}
			
	   }
	}
		 
	return neighborFaces;
		 
}


//Algorithm 3: Check if a point is inside a face
//Input: p - input point (x, y)
//       faceVerIndices: array of face vertex indices
//       vertices: array of vertex coordinates (x, y)
function insidePolygon(p, faceVerIndices, vertices)
{
	  //Computational complexity is V 
	  // V is the number of vertices of the given face
	  
	  var counter = 0;
	  var i;
	  var xintercept;
	  var p1 = new Array(2);
	  var p2 = new Array(2);

	  var startInd = faceVerIndices[0];
	  p1[0] = vertices[startInd][0];
	  p1[1] = vertices[startInd][1];
	  for (i=1;i<faceVerIndices.length;i++) {
		 
		var ind = faceVerIndices[i];
		p2[0] = vertices[ind][0];
		p2[1] = vertices[ind][1];
		
		if (p[1] > Math.min(p1[1],p2[1])) {
		  if (p[1] <= Math.max(p1[1],p2[1])) {
			if (p[0] <= Math.max(p1[0],p2[0])) {
			  if (p1[1] != p2[1]) {
				xintercept = (p[1]-p1[1])*(p2[0]-p1[0])/(p2[1]-p1[1])+p1[0];
				if (p1[0] == p2[0] || p[0] <= xintercept)
				{
				  counter++;
				}
			  }
			}
		  }
		}
		p1[0] = p2[0];
		p1[1] = p2[1];
	  }

	  if (counter % 2 == 0)
	  {
		return false;
	  }
	  else
	  {
		return true;
	  }
}

//Queue class to help implement algorithm 4
class Queue {
	  constructor() {
		this.elements = {};
		this.head = 0;
		this.tail = 0;
	  }
	  enqueue(element) {
		this.elements[this.tail] = element;
		this.tail++;
	  }
	  dequeue() {
		const item = this.elements[this.head];
		delete this.elements[this.head];
		this.head++;
		return item;
	  }
	  peek() {
		return this.elements[this.head];
	  }
	  get length() {
		return this.tail - this.head;
	  }
	  get isEmpty() {
		return this.length === 0;
	  }
}

//Algorithm 4: find layer of neighboring faces of a face
//Input: faceid -- identifier of the face
//       facemap -- key: face id, value: array of vertex id of the face
//Output: array of array of neighboring faces
function findLayersNeighorFaces(faceid, faceMap) { 

    var layersNeighbors = new Array();
	
	var visited = new Set();
	var neighborQ = new Queue();

	neighborQ.enqueue(faceid);

	while (!neighborQ.isEmpty)
	{
		var faceid = neighborQ.peek();
		neighborQ.dequeue();

		var neighbors = findNeighorFaces(faceid, faceMap);
		
		layersNeighbors[faceid] = neighbors;
		
		visited.add(faceid);

		for (var i = 0; i < neighbors.length; i++)
		{
			var fid = neighbors[i];
			if(!visited.has(fid))
			{
				neighborQ.enqueue(fid);
			}
			
		}
	}
	
	return layersNeighbors;
}
