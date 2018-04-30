/*
 1- add scroll feature  (ok)
 2- add event listener , remove event listener to row   (ok)
 3- enable format row (format for each cell)  (ok)
 4- enable update row data by id  (ok)
 5- enable order data (all , by page)
 6- enable search in grid
 7- enable re-render 
 */
define([], function() {
	
	var generic_grid = function ($options)
	{
		var _default = {
			scrollProperties: {
				width: "100%",
				height: "100%",
				rowHeight: "",
				contentLength: 0,
				hiddenElmId: ""
			},
			modal: [],
			name: "", // it is important to enter name of grid
			datasource: {},
			key: "",
			showheader: false
		}
		var _allowKeys = {

			scroll: ["width", "height", "rowHeight", "contentLength"],
			table: ["scrollProperties", "modal", "name", "datasource", "key", "showheader"]
		}
		//var _errors = new aymax_variables.SErrors();
		var dataSource = null;
		this.key = null;
		this.keys = [];
		this.gridOptions = {};
		this.listeners = {};  // add listener according to row
		this.vScroll = null;
		var that = this;
		this.rowClass = "";
		var isComplete = false;
		var search = {
			sClass: null,
			minSerachLength: 3,
			soptions:
					{
						shouldSort: true,
						matchAllTokens: true,
						findAllMatches: true,
						threshold: 0.6,
						location: 0,
						distance: 0,
						maxPatternLength: 32,
						minMatchCharLength: 1,
						keys: ["title"]
					},
			elem: null,
			searchTags: []


		}

		var sort = {};
		var _sorted_keys = [];
		var searchs = null;
		var deepth = 3;
	    var _rowsClassback = null;
		


		var scroller = function ($p)
		{
			var _self = this;
			this._lastTop = null;
			this.mainContent = null;
			this.Heights = 0;
			this.sHeight = 0;
			this._scroller = null;
			this._containerHeight = 0;
			this.page_items_num = 0;
			this.maxNum = 0;
			this.buffer = 0;


			var _render = function ()
			{
				var scrollTop = _self.mainContent.scrollTop;
				var _lastTop = _self._lastTop;

				window.requestAnimationFrame(_render);

				if (scrollTop === _lastTop)
					return;


				if (!_lastTop || Math.abs(scrollTop - _lastTop) > _self.buffer) {
					var rendered = _self._part();
					_self._lastTop = scrollTop;
				}

			}

			this.getLastScroll = function ()
			{
				return this._lastTop;
			}
			this.begin = function ()
			{
				var h = $p["rowHeight"] * $p["contentLength"]; // total height of all rows of data (height of scroll)
				h = h + "px";
				var _con = document.createElement("div");
				var _s = document.createElement("div");
				
				deepth = typeof $p["deepth"] != 'undefined'? $p["deepth"] : deepth;
				if(typeof $p["height"] == 'undefined')
				{
					
					var itm =  document.getElementById($p["renderElm"]);
					var sub = 0;
					for(d=0;d<deepth;d++)
					{
						itm = itm.parentNode;
					}
					if(typeof $p["sub"] != 'undefined')
					{
						var _ar = $p["sub"];
						for(s=0;s<_ar.length;s++)
						{
							var sub_elem = document.getElementsByClassName(_ar[s])[0];
							sub += sub_elem.clientHeight;
						}
				
					}
					
					$p["height"] = parseInt(itm.style.height) - sub; 
				}
				
				//console.log("height___",$p["height"]);
				
				_con.style.cssText = 'width:' + $p["width"] + ';height:' + $p["height"] + 'px;position:relative;overflow-y:scroll;background-color: #fff;';
				_s.style.cssText = "opacity:0;position:absolute;top:0;left:0;width:1px;height:" + h;
				this._containerHeight = $p["height"];
				this._scroller = _s;
				this.mainContent = _con;
				this.mainContent.appendChild(this._scroller);
				//$(this.mainContent).niceScroll({cursorcolor: "#5D9838"});
				this.Heights = Array($p["contentLength"]).fill($p["rowHeight"]);

				this.sHeight = this.ScrollHeight();
				this._iPositions = this._iPositions || Array($p["contentLength"]).fill(0);
				this.ItemsPositions(0);
				this._part(this._lastTop !== null);
			}
			this._From = function (scrollTop) {

				var i = 0;
				while (this._iPositions[i] < scrollTop) {
					i++;
				}
				return i;
			}
			this._part = function (force)
			{
				var config = $p;
				var element = this.mainContent;
				var scrollTop = _self.mainContent.scrollTop;
				var total = config["contentLength"];
				var from = this._From(scrollTop) - 1;

				if (from < 0 || from - this.page_items_num < 0) {
					from = 0;
				}
				if (!force && this._lastFrom === from) {
					return false;
				}

				this._lastFrom = from;
				var to = from + this.maxNum;

				if (to > total || to + this.maxNum > total) {
					to = total;
				}


				var fragment = document.createDocumentFragment();
				var scroller = this._scroller;

				// Keep the scroller in the list of children.
				fragment.appendChild(scroller);

				for (var i = from; i < to; i++) {
					var row = this._gRow(i);
					fragment.appendChild(row);
				}
				element.innerHTML = '';
				element.appendChild(fragment);
				setTimeout(function(){
					
					if($options.scrollProperties._rowsClassback != null)
					{
						
						//console.log("call_the_fn");
						$options.scrollProperties._rowsClassback();
					}
					
					
				}, 100);
				
				
				

			}
			this._gRow = function (i) {

				var config = $p;
				var item = config.rowTemplate(i);
				var height = item.height;
				if (height !== undefined) {
					item = item.element;
					if (height !== this.Heights) {
						this.Heights[i] = height;
						this.ItemsPositions(i);
						this.sHeight = this.ScrollHeight(i);
					}
				} else {
					height = this.Heights[i];
				}
				var top = this._iPositions[i];
				top = top + "px";
				item.style.cssText = "position:absolute;top:" + top;
				return item;
			}
			this.ScrollHeight = function ()
			{
				var scrollHeight = this.Heights.reduce(function (a, b) {
					return a + b;
				}, 0);

				this._scroller.style.cssText = "opacity:0;position:absolute;top:0;left:0;width:1px;height:" + scrollHeight + "px";
				var sortedItemHeights = this.Heights.slice(0).sort(function (a, b) {
					return a - b;
				});
				var middle = Math.floor($p["contentLength"] / 2);
				var averageHeight = $p["contentLength"] % 2 === 0 ? (sortedItemHeights[middle] + sortedItemHeights[middle - 1]) / 2 : sortedItemHeights[middle];
				var containerHeight = this.mainContent.clientHeight ? this.mainContent.clientHeight : this._containerHeight;
				this.page_items_num = Math.ceil(containerHeight / averageHeight);
				this._containerHeight = containerHeight;
				this.maxNum = Math.max(this.maxNum || 0, this.page_items_num * 3);
				this.buffer = averageHeight;
				return scrollHeight;
			}
			this.ItemsPositions = function ()
			{
				var from = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
				if (from < 1) {
					from = 1;
				}
				for (var i = from; i < $p["contentLength"]; i++) {
					this._iPositions[i] = this.Heights[i - 1] + this._iPositions[i - 1];
				}
			}

			this.begin();
			_render();

		}


		var template = function ($index)
		{
			var k = $options.scrollProperties.keys[$index];
			var content = $options.datasource[k];


			var row = document.getElementById($options.name + "_" + k);
			if (!_.isEmpty(row) && _.isElement(row))
			{
				row.innerHTML = "";
			} else {

				row = document.createElement('div');
				row.setAttribute("id", $options.name + "_" + k);
				row.setAttribute("class", "main_row " + $options.scrollProperties.rowClass);
				row.setAttribute("data-row-id", k);
				//row.setAttribute("id",k);
				//add events (listeners)
				if (typeof $options.events != 'undefined')
				{
					for (var i in $options.events)
					{
						var event_is = $options.events[i];
						if (event_is.type == "row")
						{
							for (var j in event_is.listener)
							{
								var listener = event_is.listener[j];
								removeEvent(row,listener["name"]);
								addEvent(row, listener["name"], listener["listen"], {type: "row"})

							}


						}


					}

				}


			}
			cellRender(row, content, k);
			return row;
		}
		var modal = "";
		var cell = "";

		var cellRender = function (row, content, k)
		{
			if(typeof content !='undefined')
			{
				modal = "";
				cell = "";
				
				for (var i in $options.modal)
				{
					modal = $options.modal[i];
					cell = document.createElement('div');

					cell.innerHTML = content[modal["index"]] === "" ? "---" : content[modal["index"]];

					if (typeof modal["format"] != 'undefined')
						cell.innerHTML = modal["format"](content[modal["index"]], {rowId: k}, {});


					if (typeof modal["width"] != 'undefined' && modal["width"] != "")
						cell.style.cssText = "width:" + modal["width"] + "%";


					//  var div = document.createElement('div');
					cell.setAttribute("id", $options.name + "_" + modal["index"] + "_" + k);
					if (typeof modal["class"] != 'undefined')
						cell.setAttribute("class", modal["class"]);


					row.appendChild(cell);

					if (typeof modal["listener"] != 'undefined')
					{
						for (var j in modal["listener"])
						{
							var listener = modal["listener"][j];
							removeEvent(cell,listener["name"]);
							addEvent(cell, listener["name"], listener["listen"], {type: "cell"})

						}
					}
				}
			}
	 
		}
		var headerRender = function ()
		{
			if (typeof $options.headers != 'undefined')
			{
				header = "";
				cell = "";
				row = document.createElement('div');
				row.setAttribute("class", "n_header_cls");
				for (var i in $options.headers)
				{
					header = $options.headers[i];
					cell = document.createElement('div');
					if (typeof $options.modal[i]["width"] != 'undefined' && $options.modal[i]["width"] != "")
						cell.style.cssText = "width:" + $options.modal[i]["width"] + "% ;display: inline-block;";
					if (typeof header["class"] != 'undefined')
						cell.setAttribute("class", header["class"]);

					cell.innerHTML = header["title"];
					if (typeof header["format"] != 'undefined')
						cell.innerHTML = header["format"]();
					row.appendChild(cell);
				}
				return row;
			}

			return null;
		}
		var r = function ()
		{

			dataSource = $options.datasource;
			this.keys = Object.keys(dataSource);
			this.key = $options.key;
			$options.scrollProperties.template = template;
			$options.scrollProperties.keys = this.keys;
			$options.scrollProperties.columns = _col();
			$options.scrollProperties.contentLength = Object.keys(dataSource).length;
			this.rowClass = "row_grid ";
			if (typeof $options.rowclass != 'undefined')
				this.rowClass += $options.rowclass;

			$options.scrollProperties.rowTemplate = template;
			$options.scrollProperties.rowClass = this.rowClass;
			$options.scrollProperties.renderElm = $options.renderElm;
			if(_rowsClassback != null)
			     $options.scrollProperties._rowsClassback = _rowsClassback;
			
			this.vScroll = new scroller($options.scrollProperties);



			document.getElementById($options.renderElm).innerHTML = "";
			if (typeof $options.showheader != 'undefined' && $options.showheader == true)
			{
				var header_html = headerRender();
				if (header_html != null)
				{
					document.getElementById($options.renderElm).appendChild(header_html)
				}
			}



			document.getElementById($options.renderElm).appendChild(this.vScroll.mainContent)
			sort["isSorted"] = false;
			sort["key"] = "";
			sort["type"] = "asc";
			sort["current"] = "asc";
			sort["asc_text"] = "A-Z";
			sort["desc_text"] = "Z-A";

			// add search feature if added
			if (typeof $options.search != "undefined")
			{
				if (typeof $options.search.elem != "undefined")
				{

					search.elem = document.getElementById($options.search.elem);
					if ($options.search.minSerachLength != "undefined")
						search.minSerachLength = $options.search.minSerachLength;
					if ($options.search.searchTags != "undefined")
						search.searchTags = $options.search.searchTags;


					searchs = new JsSearch.Search(this.key);
					searchs.indexStrategy = new JsSearch.AllSubstringsIndexStrategy();
					var REGEX = /\s+/; // Split on spaces
					const tokenizer = {
						tokenize(text) {
							return text
									.split(REGEX)
									.filter(
											(text) => text // Filter empty tokens
									);
						}
					}
					searchs.tokenizer = tokenizer;

					_.each(search.searchTags, function (tag)
					{
						searchs.addIndex(tag);
					});

					searchs.addDocuments(_.toArray($options.datasource));
					/*
					 var d = {};
					 d["main_data"] = {
					 "data": _.toArray($options.datasource)
					 };
					 var key = search.searchTags[0];
					 */
					removeEvent(search.elem,"keyup");
					addEvent(search.elem, "keyup", function (id)
					{
						result = $options.datasource;
						
						if (search.elem.value.length >= search.minSerachLength)
						{
							var result = searchs.search(search.elem.value);
							// var result = JSON.search(d, '//*[contains(' + key + ', "' + search.elem.value + '")]');  // searchs.search(search.elem.value);
							
							result = _.indexBy(result, $options.key);
							
							var tokens = searchs.tokenizer.tokenize(search.elem.value);
							
						}
						
						dataSource = result;
						
						sortG(sort.current);
						
					   
					})

				}


			}


			// add sort feature
			if (typeof $options.sort != "undefined")
				sort.key = $options.sort;


			if (!isComplete)
			{
				if (typeof $options.complete != 'undefined' && typeof $options.complete == "function")
				{
					$options.complete();
				}
				isComplete = true;
			}

			//$.material.checkbox();

		}

		var sortG = function (sort_type , elem)
		{

			sort.current =  sort.type = (typeof sort_type != 'undefined' && sort_type !="") ? sort_type : sort.type;
			
			sort.isSorted = true;
			var r = {};
			var slist = [];
			if (sort.type == "asc")
			{
				slist = _.sortBy(_.toArray(dataSource), sort.key);
				sort.type = "desc";
			} else {
				slist = _.sortBy(_.toArray(dataSource), sort.key).reverse();
				sort.type = "asc";
			}
			
			
			if(typeof elem !='undefined')
			   $(elem).text(sort.type == "asc"?sort.asc_text:sort.desc_text);
				
				
			_sorted_keys = _.pluck(slist, $options.key);
			
		
			reRender(dataSource);
		}
		var sortByKey = function (sort_type, key)
		{

		   sort.current =  sort.type = (typeof sort_type != 'undefined' && !_.isEmpty(sort_type)) ? sort_type : sort.type;
			
			sort.isSorted = true;
			var r = {};
			var slist = [];
			if (sort.type == "asc")
			{
				slist = _.sortBy(_.toArray(dataSource), key);
				sort.type = "desc";
			} else {
				slist = _.sortBy(_.toArray(dataSource), key).reverse();
				sort.type = "asc";
			}
			_sorted_keys = _.pluck(slist, $options.key);
			reRender(dataSource);
		}

		var _col = function ()
		{
			var col_sizes = [];
			for (var i in $options.modal)
			{
				col_sizes.push((typeof $options.modal[i].width != "undefined" && $options.modal[i].width != "") ? $options.modal[i].width : 1);
			}
			return col_sizes;
		}

		var reRender = function (re)
		{
			
			dataSource = re;
			this.keys = Object.keys(dataSource);
			$options.scrollProperties.keys = _sorted_keys.length > 0 ? _sorted_keys :  this.keys;
			$options.scrollProperties.contentLength = Object.keys(dataSource).length;
			if(_rowsClassback != null)
			     $options.scrollProperties._rowsClassback = _rowsClassback;
			this.vScroll = new scroller($options.scrollProperties);
			document.getElementById($options.renderElm).innerHTML = "";
			
			if (typeof $options.showheader != 'undefined' && $options.showheader == true)
			{
				var header_html = headerRender();
				if (header_html != null)
				{
					document.getElementById($options.renderElm).appendChild(header_html)
				}
			}

			
			
			document.getElementById($options.renderElm).appendChild(this.vScroll.mainContent);
			
			if (typeof $options.renderCallback != "undefined")
			{
				$options.renderCallback(re);
			}
			//$.material.init();
		}
		var ur = function (id, rowdata, type)   // type (add , update , delete)
		{
			
			//console.log("Object.keys",Object.keys($options.datasource).length);
			if(Object.keys($options.datasource).length == 0)
			{
				dataSource ={};
				$options.datasource ={};
			}
			
			dataSource[id] = rowdata;
			$options.datasource[id] = rowdata;
			
			//console.log("$options.datasource",$options.datasource);
			
			if (searchs != null)
				searchs.addDocuments(_.toArray($options.datasource));
			switch (type) {
				case "add":
					////console.log("add_new");
					//_sorted_keys.push(id);
					//reRender(this.dataSource);
					sortG(sort.current);
					break;
				case "update":
					////console.log("update_exist__");
					// check if html already exist (update it)
				    var tr = document.getElementById($options.name + "_" + id);
					if (!_.isEmpty(tr) && _.isElement(tr) && tr != null) // tr is already exist
					{
						setTimeout(function () {
							tr.innerHTML = "";
							cellRender(tr, rowdata, id);
							
							setTimeout(function(){
					
								if(_rowsClassback != null)
									_rowsClassback();
				             }, 100);
							
							
							//console.log("tr_after_update__", tr);

						}, 1);

					}
					break;
				case "delete":
					delete   dataSource[id];
					delete $options.datasource[id];
					if (searchs != null)
					{
						searchs.addDocuments(_.toArray($options.datasource));
						
					}
					sortG(sort.current);
					break;
			}
		}
		var urSocket = function (id, rowdata, type)   // type (add , update , delete)
		{
			dataSource[id] = rowdata;
			$options.datasource[id] = rowdata;
			if (this.vScroll.mainContent.scrollTop === this.vScroll.getLastScroll())
			{

				var tr = document.getElementById($options.name + "_" + id);
				if (!_.isEmpty(tr) && _.isElement(tr) && tr != null) // tr is already exist
				{
					setTimeout(function () {
						tr.innerHTML = "";
						cellRender(tr, rowdata, id);
						//console.log("tr__", tr);
						//console.log('update__' + $options.name + "_" + id);
					}, 1);

				}

			}

		}
		var setSource = function (data)
		{
			dataSource =  data;
			$options.datasource=data;
			this.keys = Object.keys(dataSource);
		}
		var getSource = function ()
		{
			return dataSource;
		}


		var reset = function ()
		{
			dataSource = {};
			this.keys = [];
		}
		var addEvent = function (elem, ev, c, options)
		{
			var id = null;
			if (typeof options != 'undefined')
			{
				if (options.type == "row")
					id = elem.getAttribute("data-row-id");
				if (options.type == "cell")
					id = elem.parentElement.getAttribute("data-row-id");

			}


			if (elem.addEventListener)
				elem.addEventListener(ev, function (event)
				{
					c(id, elem, event);
				});
			else
				elem.attachEvent("on" + ev, function (event)
				{
					c(id, elem, event);
				});
		}
		var removeEvent = function (elem, ev, c, options)
		{

			var id = null;
			if (typeof options != 'undefined')
			{
				if (options.type == "row")
					id = elem.getAttribute("data-row-id");
			}


			if (elem.removeEventListener)
				elem.removeEventListener(ev, function ()
				{
					if(typeof c !='undefined')
					  c(id);
				});


		}
		var addEventById = function (id, ev, c, options)
		{
			var elem = "";
			if (typeof options != 'undefined')
			{
				if (options.type == "row")
					elem = this.rowClass;
			}

			elem = elem + "_" + id;
			elem = document.getElementById(elem);
			addEvent(elem, ev, c, options);
		}
		var removeEventById = function (id, ev, c, options)
		{
		}
		var setRowsClassback = function(_callback)
		{
			//console.log("set_fn ");
			_rowsClassback = _callback;
		}

		return {
			render: r,
			updateRow: ur,
			updateRowSocket: urSocket,
			addEventListenerById: addEventById,
			removeEventListenerById: removeEventById,
			resetGrid: reset,
			sortGrid: sortG,
			sortByKey: sortByKey,
			getSource: getSource,
			setSource: setSource,
			setRowsClassback:setRowsClassback
		}


	}

	return {
		generic_grid : generic_grid
		
	}
	
});
