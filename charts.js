/*
By Gor Grigoryan
Javascript is something new to me cuz my knowledge is based on Java, C++, and a little Python. I do not know much about interesting tricks 
in this language, so if you have any suggestion, you can write them.
*/

let chartFirm
let chartDemandSupply
        
function updateVisibilityFirm(){
    chartFirm.setDatasetVisibility(0, document.getElementById("showMC").checked)
    chartFirm.setDatasetVisibility(1, document.getElementById("showAVC").checked)
    chartFirm.setDatasetVisibility(2, document.getElementById("showATC").checked)
    chartFirm.setDatasetVisibility(3, document.getElementById("showAFC").checked)
    chartFirm.setDatasetVisibility(4, document.getElementById("showPrice").checked)
    chartFirm.update()
}

function createChartDemandSupply()
{
    chartDemandSupply = new Chart(document.getElementById("graph-demandsupply"), {
        type:"scatter",
        data:{
            datasets:[
                {label:"Consumer Surplus",data:[], pointRadius: 3,fill:true, showLine:true,pointRadius:0, order:0},
                {label:"Demand curve",data:[],pointRadius: 3,order: 1,showLine:true, order:1},
                {label:"Supply curvee",data:[],showLine:true,pointRadius: 3, order:1},
                {label:"Market Price (Marginal Revenue)", data:[], pointRadius: 3,pointRadius: 3,showLine:true, order:1},
                {label:"Equilibrium", data: [],pointRadius: 6,order: 2},
                {label:"Producer Surplus",data:[],fill:true,showLine:true,pointRadius:0, order:0},
            ]
        },
            
        options:{
            animation:{
                duration:600,
                easing:'easeInOutQuart'
            }, 
            responsive:true,
            maintainAspectRatio:false,
            plugins:{
                title:{
                    display:true,
                    text:"Market Curves"
                }
            },
            scales:{
                x:{title:{display:true,text:"Quantity"},min:0},
                y:{title:{display:true,text:"Price"},min:0,max:15} // i set max 15 because my supply and demand curves are based on price and it will look awkward
            }
        
        }
    })
}

function createChartFirm(){

    chartFirm = new Chart(document.getElementById("graph-firm"),{ 
        type:"scatter",
        data:{
            datasets:[
                {label:"Marginal Cost (MC)",data:[],showLine:true},
                {label:"Average Variable Cost (AVC)",data:[],showLine:true},
                {label:"Average Total Cost (ATC)",data:[],showLine:true},
                {label:"Average Fixed Cost (AFC)",data:[],showLine:true},
                {label:"Marginal Revenue (Price=MR)",data:[],showLine:true},
                {label:"Optimal Quantity",data:[],pointRadius:7},
                {label:"Profit",data:[],fill:true,showLine:true,pointRadius:0, order:0},
            ]
        },
            
        options:{
            animation:{
                duration:600,
                easing:'easeInOutQuart'
            }, 
            responsive:true,
            maintainAspectRatio:false,
            plugins:{
                title:{
                    display:true,
                    text:"Firm Cost Curves"
                }
            },
            scales:{
                x:{title:{display:true,text:"Quantity"},min:0},
                y:{title:{display:true,text:"Price"},min:0,max:15} // i set max 15 because my supply and demand curves are based on price and it will look awkward
            }
        
        }
    
    })

}

// thanks to the guy from stackoverflow
function findIntersection(p1, p2, p3, p4) {
    // Standard line-line intersection formula
    // (x1, y1) to (x2, y2) and (x3, y3) to (x4, y4)
    const denominator = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
    
    if (denominator === 0) return null; // Parallel lines

    let ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denominator;
    
    // Is the intersection point within the bounds of both segments?
    if (ua >= 0 && ua <= 1) {
        let ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denominator;
        if (ub >= 0 && ub <= 1) {
            return {
                x: p1.x + ua * (p2.x - p1.x),
                y: p1.y + ua * (p2.y - p1.y)
            };
        }
    }
    return null;
}

// Use a nested loop to check every segment against every other segment
function findEquilibrium(demand, supply) {
    for (let i = 0; i < demand.length - 1; i++) {
        for (let j = 0; j < supply.length - 1; j++) {
            let point = findIntersection(demand[i], demand[i+1], supply[j], supply[j+1]);
            if (point) return point;
        }
    }
    return null;
}

// intersection of demand and priceline curve to find shortages, surpluses and etc
function findConsumerSurplusPointDemand(demand, price) {
    for (let i = 0; i < demand.length - 1; i++) {
        for (let j = 0; j < price.length - 1; j++) {
            let point = findIntersection(demand[i], demand[i+1], price[j], price[j+1]);
            if (point) return point;
        }
    }
    return null;
}

function findConsumerSurplusPointSupply(supply, price) {
    for (let i = 0; i < supply.length - 1; i++) {
        for (let j = 0; j < price.length - 1; j++) {
            let point = findIntersection(supply[i], supply[i+1], price[j], price[j+1]);
            if (point) return point;
        }
    }
    return null;
}

function findPriceMarginalCost(marginalCost, price) {
    for (let i = 0; i < marginalCost.length - 1; i++) {
        for (let j = 0; j < price.length - 1; j++) {
            let point = findIntersection(marginalCost[i], marginalCost[i+1], price[j], price[j+1]);
            if (point) return point;
        }
    }
    return null;
}

function interpolate(x, x1, y1, x2, y2) {
  return y1 + (x - x1) * (y2 - y1) / (x2 - x1);
}

function getATCPoint(ATC, intersection) {
    return interpolate(intersection.x, ATC[2].x, ATC[2].y, ATC[3].x, ATC[3].y)
}

function updateSimulationFirm(){

    let P = parseFloat(document.getElementById("priceSlider").value)
    let FC = parseFloat(document.getElementById("fcSlider").value)
    
    let mcInput = document.getElementById("mcvalues").value
    let mcArray = mcInput.split(",").map(Number)
    
    let MC=[{x: 0, y: 0}]
    let AVC=[{x: 0, y: 0}]
    let ATC=[]
    let AFC=[]
    let priceLine=[{x: 0, y: P}]
    
    let VC=0
    let optimalQ=0
    
    for(let i=0;i<mcArray.length;i++){ // loop of marginal costs
    
        let q=i+1 // quantity, no need 0 cuz 0 quantity 0$
        let mc=mcArray[i] // marginal cost
        
        VC+=mc // full variable cost
        
        let avc=VC/q // average variable cost = variable cost / quantity
        let atc=(FC+VC)/q // average total cost = total cost(fixed cost + variable cost) / quantity
        let afc=FC/q // average fixed cost, in long run is 0, lol idk why i have done this maybe to show that in long run we dont have or consider any fixed costs
        
        MC.push({x:q,y:mc})
        AVC.push({x:q,y:avc})
        ATC.push({x:q,y:atc})
        AFC.push({x:q,y:afc})
        priceLine.push({x:q,y:P})
    
    }

    for (let i = 0; i < mcArray.length; i++) {
        let currentMC = mcArray[i];
        let nextMC = mcArray[i + 1];
        let q = i+1;

        if (P >= currentMC) {
            if (nextMC !== undefined && P <= nextMC) {
                // Interpolate: q + fraction of the way to the next unit
                let slope = nextMC - currentMC;
                optimalQ = q + (P - currentMC) / slope;
                break;
            } else if (nextMC === undefined) {
                optimalQ = q; // At the end of the array
            }
        }
    }
    
    let totalVC = 0;
    if (optimalQ > 0) {
        let fullUnits = Math.floor(optimalQ);
        totalVC = mcArray.slice(0, fullUnits).reduce((a, b) => a + b, 0);
        
        // Add partial unit cost if interpolating
        if (optimalQ > fullUnits && fullUnits < mcArray.length) {
            let portion = optimalQ - fullUnits;
            let mcAtPoint = mcArray[fullUnits - 1] + (mcArray[fullUnits] - mcArray[fullUnits - 1]) * portion;
            totalVC += mcAtPoint * portion;
        }
    }

    let TC = FC + totalVC // so total cost will be equal fixed cost + variable cost of optimal one
    let profit = P*optimalQ - TC // i think no need to say that profit = revenue-total cost
    
    let avcAtQ = optimalQ>0 ? totalVC/optimalQ : 0 // it is average variable cost for OPTIMAL quantity
    
    let status=""
    
    if(P < avcAtQ){ // if our price is even lower than average variable cost than go out bruh
        optimalQ=0
        profit=0
        status="Shutdown (P < AVC)"
    }
    else if(profit>0){
        status="Firm gains profits"
    }
    else if(profit<0){
        status="Firm gains losses"
    }
    else {
        status="Firm get no profit and no loss"
    }
    
    document.getElementById("results").innerHTML="Optimal Quantity: "+optimalQ.toFixed(2)+"<br>"+"Profit: "+profit.toFixed(2)+"<br>"+" "+status
    document.querySelectorAll("input[type=checkbox]").forEach(box=>{
        box.addEventListener("change",updateVisibilityFirm)
    })

    let atcAtOptimalQ = (FC + totalVC) / optimalQ;
    let profitMC = findPriceMarginalCost(MC, priceLine)
    let profitCurve = [
        {x:0,y:P},{x:optimalQ,y:P}, {x:optimalQ,y:atcAtOptimalQ}, {x:0,y:atcAtOptimalQ}, {x:0,y:P}
    ]
    
    // setting info to charts
    chartFirm.data.datasets[0].data = MC
    chartFirm.data.datasets[1].data = AVC
    chartFirm.data.datasets[2].data = ATC
    chartFirm.data.datasets[3].data = AFC
    chartFirm.data.datasets[4].data = priceLine
    chartFirm.data.datasets[5].data = [{x:optimalQ,y:P}]
    chartFirm.data.datasets[6].data = profitCurve
    
    // updating chart with animation bla bla
    chartFirm.update()

}

function quantityDemanded(P){
    return 10 - P
}

function updateSimulationDemandSupply()
{
    let P = parseFloat(document.getElementById("priceSlider").value)
    let firms = parseFloat(document.getElementById("firmsSlider").value)

    let mcInput = document.getElementById("mcvalues").value
    let mcArray = mcInput.split(",").map(Number)

    let demand = []
    let supply = [{x: 0, y: 0}]
    let maxQ = mcArray.length * firms

    for(let i = 0; i < mcArray.length; i++){
        let q = (i + 1) * firms// our supply is based how much quantity can produce firm * how much firms are there
        let p = mcArray[i] // so the price is the marginal cost lol
        supply.push({x:q, y:p})
    }

    for(let q = 0; q <= maxQ; q++){
        if(10-q>=0) // demand here is constant but i will change it(i hope)
            demand.push({x:Math.max(0, q),y:Math.max(0, 10 - q)})
    }

    let priceLine = [{x:0,y:P}, {x:maxQ,y:P}]

    let equil = findEquilibrium(demand, supply) // finding equilibrium
    let currPriceDemand = findConsumerSurplusPointDemand(demand, priceLine)
    let currPriceSupply = findConsumerSurplusPointSupply(supply, priceLine)

    // try to understand please i will not explain this shit
    let consumerSurplus=[]
    if(P >= equil.y) {
        consumerSurplus=[
            {x:0,y:demand[0].y},
            {x:demand[0].x,y:demand[0].y},
            {x:0,y:currPriceDemand.y},
            {x:currPriceDemand.x, y:currPriceDemand.y},
            {x:0,y:demand[0].y}
        ]
    }
    else{
        consumerSurplus=[
            {x:0,y:demand[0].y},
            {x:demand[0].x,y:demand[0].y},
            {x:equil.x,y:equil.y},
            {x:currPriceSupply.x, y:currPriceSupply.y},
            {x:0,y:P},
            {x:0,y:demand[0].y}
        ]
    }

    let producerSurplus=[]
    if(P <= equil.y) {
        producerSurplus=[
            {x:0,y:supply[0].y},
            {x:supply[0].x,y:supply[0].y},
            {x:currPriceSupply.x, y:currPriceSupply.y},
            {x:0,y:currPriceSupply.y},
            {x:0,y:supply[0].y}
        ]
    }
    else{
        producerSurplus=[
            {x:0,y:supply[0].y},
            {x:supply[0].x,y:supply[0].y},
            {x:equil.x,y:equil.y},
            {x:currPriceDemand.x, y:currPriceDemand.y},
            {x:0,y:P},
            {x:0,y:supply[0].y}
        ]
    }

    // ok i think its easy just try to understand the states
    let status = ""
    if(P>equil.y)
        status = "Surplus"
    else if(P<equil.y)
        status = "Shortage"
    else
        status = "Equillibrium"

    document.getElementById("results2").innerHTML="Equilibrium quantity: "+equil.x.toFixed(2)+"<br> Equilibrium price: " + equil.y.toFixed(2)+"<br>"+
        "Market price: " + P+"<br>"+status

    // updating info and curve
    chartDemandSupply.data.datasets[1].data = demand
    chartDemandSupply.data.datasets[2].data = supply
    chartDemandSupply.data.datasets[3].data = priceLine
    chartDemandSupply.data.datasets[4].data = equil
    chartDemandSupply.data.datasets[0].data = consumerSurplus
    chartDemandSupply.data.datasets[5].data = producerSurplus
    chartDemandSupply.update()
}

document.getElementById("priceSlider").addEventListener("input",function(){
    document.getElementById("priceValue").innerText=this.value
    updateSimulationFirm()
    updateSimulationDemandSupply()
})

document.getElementById("fcSlider").addEventListener("input",function(){
    document.getElementById("fcValue").innerText=this.value
    updateSimulationFirm()
})

document.getElementById("mcvalues").addEventListener("input",function(){
    updateSimulationFirm()
    updateSimulationDemandSupply()
})

document.getElementById("firmsSlider").addEventListener("input",function(){
    document.getElementById("firmsValue").innerText=this.value
    updateSimulationDemandSupply()
})

// creating charts
createChartFirm()
createChartDemandSupply()

// updating what graph to show
updateVisibilityFirm()

// updating simulation
updateSimulationFirm()
updateSimulationDemandSupply()