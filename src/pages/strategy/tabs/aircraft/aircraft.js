(function(){
	"use strict";
	
	KC3StrategyTabs.aircraft = new KC3StrategyTab("aircraft");
	
	KC3StrategyTabs.aircraft.definition = {
		tabSelf: KC3StrategyTabs.aircraft,
		
		squadNames: {},
		_items: {},
		_holders: {},
		_slotNums: {},
		
		/* INIT
		Prepares all data needed
		---------------------------------*/
		init :function(){
			var self = this;
			
			// Get squad names
			if(typeof localStorage.planes == "undefined"){ localStorage.planes = "{}"; }
			this.squadNames = JSON.parse(localStorage.planes);
			
			// Compile equipment holders
			var ctr, ThisItem, MasterItem, ThisShip, MasterShip;
			for(ctr in KC3ShipManager.list){
				this.checkShipSlotForItemHolder(0, KC3ShipManager.list[ctr]);
				this.checkShipSlotForItemHolder(1, KC3ShipManager.list[ctr]);
				this.checkShipSlotForItemHolder(2, KC3ShipManager.list[ctr]);
				this.checkShipSlotForItemHolder(3, KC3ShipManager.list[ctr]);
			}
			
			// Compile ships on Index
			var thisType, thisSlotitem, thisGearInstance;
			
			function GetMyHolder(){ return self._holders["s"+this.itemId]; }
			function NoHolder(){ return false; }
			
			for(ctr in KC3GearManager.list){
				ThisItem = KC3GearManager.list[ctr];
				MasterItem = ThisItem.master();
				if(!MasterItem) continue;
				if([6,7,8,9,10,21,22,33].indexOf(MasterItem.api_type[3]) == -1) continue;
				
				// Add holder to the item object temporarily via function return
				if(typeof this._holders["s"+ThisItem.itemId] != "undefined"){
					ThisItem.MyHolder = GetMyHolder;
				}else{
					ThisItem.MyHolder = NoHolder;
				}
				
				// Check if slotitem_type is filled
				if(typeof this._items["t"+MasterItem.api_type[3]] == "undefined"){
					this._items["t"+MasterItem.api_type[3]] = [];
				}
				thisType = this._items["t"+MasterItem.api_type[3]];
				
				// Check if slotitem_id is filled
				if(typeof this._items["t"+MasterItem.api_type[3]]["s"+MasterItem.api_id] == "undefined"){
					this._items["t"+MasterItem.api_type[3]]["s"+MasterItem.api_id] = {
						id: ThisItem.masterId,
						english: ThisItem.name(),
						japanese: MasterItem.api_name,
						stats: {
							fp: MasterItem.api_houg,
							tp: MasterItem.api_raig,
							aa: MasterItem.api_tyku,
							ar: MasterItem.api_souk,
							as: MasterItem.api_tais,
							ev: MasterItem.api_houk,
							ls: MasterItem.api_saku,
							dv: MasterItem.api_baku,
							ht: MasterItem.api_houm,
							rn: MasterItem.api_leng
						},
						instances: []
					};
				}
				thisSlotitem = 	this._items["t"+MasterItem.api_type[3]]["s"+MasterItem.api_id];
				
				thisSlotitem.instances.push(ThisItem);
			}
		},
		
		/* Check a ship's equipment slot of an item is equipped
		--------------------------------------------*/
		checkShipSlotForItemHolder :function(slot, ThisShip){
			if(ThisShip.items[slot] > -1){
				this._holders["s"+ThisShip.items[slot]] = ThisShip;
				this._slotNums["s"+ThisShip.items[slot]] = slot;
			}
		},
		
		/* EXECUTE
		Places data onto the interface
		---------------------------------*/
		execute :function(){
			var self = this;
			
			$(".tab_aircraft .item_type").on("click", function(){
				$(".tab_aircraft .item_type").removeClass("active");
				$(this).addClass("active");
				self.showType($(this).data("type"));
			});
			
			$(".tab_aircraft .item_list").on("change", ".instance_name input", function(){
				self.squadNames["p"+$(this).attr("data-gearId")] = $(this).val();
				localStorage.planes = JSON.stringify(self.squadNames);
			});
			
			$(".tab_aircraft .item_type").first().trigger("click");
		},
		
		/* Show slotitem type
		--------------------------------------------*/
		showType :function(type_id){
			$(".tab_aircraft .item_list").html("");
			
			var ctr, ThisType, ItemElem, ThisSlotitem;
			for(ctr in this._items["t"+type_id]){
				ThisSlotitem = this._items["t"+type_id][ctr];
				
				ItemElem = $(".tab_aircraft .factory .slotitem").clone().appendTo(".tab_aircraft .item_list");
				$(".icon img", ItemElem).attr("src", "../../assets/img/items/"+type_id+".png");
				$(".english", ItemElem).text(ThisSlotitem.english);
				$(".japanese", ItemElem).text(ThisSlotitem.japanese);
				
				this.slotitem_stat(ItemElem, ThisSlotitem.stats, "fp");
				this.slotitem_stat(ItemElem, ThisSlotitem.stats, "tp");
				this.slotitem_stat(ItemElem, ThisSlotitem.stats, "aa");
				this.slotitem_stat(ItemElem, ThisSlotitem.stats, "ar");
				this.slotitem_stat(ItemElem, ThisSlotitem.stats, "as");
				this.slotitem_stat(ItemElem, ThisSlotitem.stats, "ev");
				this.slotitem_stat(ItemElem, ThisSlotitem.stats, "ls");
				this.slotitem_stat(ItemElem, ThisSlotitem.stats, "dv");
				this.slotitem_stat(ItemElem, ThisSlotitem.stats, "ht");
				this.slotitem_stat(ItemElem, ThisSlotitem.stats, "rn");
				
				var PlaneCtr, ThisPlane, PlaneBox, rankLines, ThisCapacity;
				for(PlaneCtr in ThisSlotitem.instances){
					ThisPlane = ThisSlotitem.instances[PlaneCtr];
					
					PlaneBox = $(".tab_aircraft .factory .instance").clone();
					$(".instances", ItemElem).append(PlaneBox);
					
					$(".instance_icon img", PlaneBox).attr("src", "../../assets/img/items/"+type_id+".png");
					
					if(ThisPlane.ace > 0){
						$(".instance_chev img", PlaneBox).attr("src", "../../assets/img/client/achev/"+ThisPlane.ace+".png");
					}else{
						$(".instance_chev img", PlaneBox).hide();
					}
					
					$(".instance_name input", PlaneBox).attr("data-gearId", ThisPlane.itemId);
					
					if(typeof this.squadNames["p"+ThisPlane.itemId] != "undefined"){
						$(".instance_name input", PlaneBox).val( this.squadNames["p"+ThisPlane.itemId] );
					}
					
					if(ThisPlane.MyHolder()){
						$(".holder_pic img", PlaneBox).attr("src", KC3Meta.shipIcon(ThisPlane.MyHolder().masterId) );
						$(".holder_name", PlaneBox).text( ThisPlane.MyHolder().name() );
						$(".holder_level", PlaneBox).text("Lv."+ThisPlane.MyHolder().level);
						
						// Compute for veteranized fighter power
						ThisCapacity = ThisPlane.MyHolder().slots[ this._slotNums["s"+ThisPlane.itemId] ];
						$(".instance_aaval", PlaneBox).addClass("activeSquad");
						$(".instance_aaval", PlaneBox).text( Math.floor(ThisPlane.fighterPower(ThisCapacity)) );
					}else{
						$(".holder_pic", PlaneBox).hide();
						$(".holder_name", PlaneBox).hide();
						$(".holder_level", PlaneBox).hide();
						$(".instance_aaval", PlaneBox).addClass("reserveSquad");
						$(".instance_aaval", PlaneBox).text( ThisSlotitem.stats.aa );
					}
				}
				
			}
			
		},
		
		/* Determine if an item has a specific stat
		--------------------------------------------*/
		slotitem_stat :function(ItemElem, stats, stat_name){
			if(stats[stat_name] !== 0){
				$(".stats .item_"+stat_name+" span", ItemElem).text(stats[stat_name]);
			}else{
				$(".stats .item_"+stat_name, ItemElem).hide();
			}
		}
		
	};
	
})();
