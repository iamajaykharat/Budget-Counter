

//Budget Controller Module
var budgetController = (function(){
   
    
    //Expense constructor
    var Expense = function(id,desc,value){     
        this.id=id;
        this.desc=desc;
        this.value=value;
        this.percentage = -1;     
    };
    
    
    //Calculate percentage of expense
    Expense.prototype.calcPer = function(totalIncome){    
        if (totalIncome > 0){
             this.percentage = Math.round((this.value / totalIncome) * 100);
        }else{
            this.percentage = -1;
        }    
    };
    
    
    //Return calculated percentage
    Expense.prototype.getPer = function(){     
        return this.percentage;    
    };
    
    
    //Income constructor
    var Income = function(id,desc,value){     
        this.id=id;
        this.desc=desc;
        this.value=value;        
    };
    
    
    //Calculate total income/expense and add to our data structure  
    var calculateTotal = function(type){     
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;     
    };
    
    
    //Our data structure to manage data
    var data = {    
        allItems: {
            exp:[],
            inc:[]
        }, 
        totals: {
            exp:0,
            inc:0        
        },
        budget: 0,
        percentage: -1    
    };
    
    
    //Public scope
    return {
      
        
        //Adding items to our data structure through function constructors
        addItem:function(type,des,val){   
            var newItem, ID;  
            
            //Creating id for each item
            if (data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else{
                ID = 0;
            }
                   
            //Creating instance of Expense or Income based on type of data
            if (type === 'exp'){
                newItem = new Expense(ID,des,val); 
            }else if (type === 'inc'){
                newItem = new Income(ID,des,val);          
            }
            
            //Adding item to data structure
            data.allItems[type].push(newItem);
            
            //Return the new item
            return newItem;     
        },
        
        
        //Delete items from our data structure
        deleteItem: function(type, id){
            var idArr, index; 
            
            //Array of ids
            idArr = data.allItems[type].map(function(cur){
               return cur.id;
            });
            
            //Finding item of given id and deleting it
            index = idArr.indexOf(id);
            if (index !== -1){
                data.allItems[type].splice(index,1);
            }         
        },
        
        
        //Calculate the budget
        calculateBudget : function(){
            
            //1.Calculate total incomes and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            //2.Calculate total budget : income - expense
            data.budget = data.totals.inc - data.totals.exp;
            
            //3.Calculate percentage of income which we spend
            if (data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else{
                data.percentage = -1;
            }      
        },
        
        
        //Calculate percentages for expense
        calculatePercentages: function(){   
            data.allItems.exp.forEach(function(cur){
                cur.calcPer(data.totals.inc);
            });   
        },
        
        
        //Return percentages
        getPercentages : function(){
            var percentages;
            percentages = data.allItems.exp.map(function(cur){
                return cur.getPer();        
            });
            return percentages;          
        },
        
        
        //Return the budget
        getBudget : function(){
            return {
                budget: data.budget,
                totalExp: data.totals.exp,
                totalInc: data.totals.inc,
                percentage: data.percentage         
            };
        },
        
        
        //For testing purpose
        testing:function(){
            console.log(data);
        }
    };   
})();


//UI Controller Module
var UIController = (function(){
    
    
    //Maintaining dom strings in object for any modification in dom
    var DomStrings = {       
        inputType:'.add__type',
        inputDesc:'.add__description',
        inputValue: '.add__value',
        inputBtn:'.add__btn',
        incomeContainer:'.income__list',
        expenseContainer:'.expenses__list',
        budgetLabel: '.budget__value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        incomeLabel: '.budget__income--value', 
        container:'.container',
        expensePercLabel:'.item__percentage',
        dateLabel:'.budget__title--month'
    };

    
    //Defining our own ForEach method for nodeList
    var nodeListForEach = function(list,callback){
        for(var i=0; i < list.length ; i++){
            callback(list[i],i);  
        }
    };
    
    
    //Format number
    var formatNumber = function(num,type){
        var numSplit,int,dec;
        
        //Convert to decimal
        num = Math.abs(num);
        num = num.toFixed(2);
        
        //Split at decimal
        numSplit = num.split('.');
        
        //Setting Comma to integer part
        int = numSplit[0];
        if ( int.length > 3){
            int = int.substr(0,int.length - 3) + ',' + int.substr(int.length - 3,3);
        }
        
        //Decimal part
        dec = numSplit[1];
        
        //Final result with + / - sign
        return (type === 'exp' ? '-':'+') + ' ' + int + '.' + dec;     
    };
   
    
    //Getting input from UI and setting it to public scope
    return {    
        
        //Getting user input
        getInput: function(){          
           return {
               type: document.querySelector(DomStrings.inputType).value,
               desc: document.querySelector(DomStrings.inputDesc).value,
               value: parseFloat(document.querySelector(DomStrings.inputValue).value)          
           };         
        },
        
        
        //Adding item to item lists(income/expense)
        addItemList: function(obj, type){
            var html, newHtml, element;
            
            //Setting html with placeholder according to type of item
            if (type === 'inc'){
                element = DomStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                
            }else if (type === 'exp'){
                element = DomStrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            //Replacing placeholder with some actual data
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%desc%',obj.desc);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value,type));
            
            //Inserting Html into our dom
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },
        
        
        //Delete item from UI
        deleteItemList: function(selectId){
            var element;
            element = document.getElementById(selectId);
            element.parentNode.removeChild(element);
        },
        
        
        //Clearing input fields after click event
        clearField : function(){
            var field, fieldArr;
            
            //Selecting multiple field
            field = document.querySelectorAll(DomStrings.inputDesc + ', ' + DomStrings.inputValue);
            
            //Converting list into array
            fieldArr = Array.prototype.slice.call(field);
            
            //For each loop
            fieldArr.forEach(function(current,index,array){
                current.value = "";
            });
            
            fieldArr[0].focus();           
        },
        
        
        //Display budget on UI
        displayBudget: function(obj){
            var type;
            
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DomStrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DomStrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DomStrings.expenseLabel).textContent = formatNumber(obj.totalExp,'exp');
            
            if (obj.percentage > 0){
                document.querySelector(DomStrings.percentageLabel).textContent = obj.percentage + '%';
            }else{
                document.querySelector(DomStrings.percentageLabel).textContent = '---';
            }    
        },
        
        
        //Display each item percentage on UI
        displayPercentage:function(perArr){
            var field;
            field = document.querySelectorAll(DomStrings.expensePercLabel);
       
            nodeListForEach(field,function(current,index){
                
                if(perArr[index] > 0){
                    current.textContent = perArr[index] + '%';
                    
                }else{
                    current.textContent = '---';
                }     
            });  
        },
        
        
        //Display month/year in UI using date object
        displayDate: function(){
            var now, months, month, year;
            
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            document.querySelector(DomStrings.dateLabel).textContent = months[month] + ' ' + year;             
        },
        
        
        //Changing focus on changing type (exp/inc)
        changeType: function(){
            var fields;
            fields = document.querySelectorAll(
                DomStrings.inputType + ',' +
                DomStrings.inputDesc + ',' +
                DomStrings.inputValue
            );
            
            nodeListForEach(fields,function(cur){
                cur.classList.toggle('red-focus');     
            });
            
            document.querySelector(DomStrings.inputBtn).classList.toggle('red');
            
        },
        
        
        // Return Domstrings to public scope
        getDomStrings: function(){
            return DomStrings;
        }
    };  
})();


//Main Controller Module
var controller = (function(budgetCtrl,UICtrl){
    
    
    //Setting all event listeners
    var setUpEventListeners = function(){      
        var Dom = UICtrl.getDomStrings();
        document.querySelector(Dom.inputBtn).addEventListener('click',ctrlAddItems);
        document.addEventListener('keypress',function(event){
        if (event.keyCode === 13 || event.which === 13){
            ctrlAddItems();
        } 
        }); 
        
        document.querySelector(Dom.container).addEventListener('click',ctrlDeleteItems);
        document.querySelector(Dom.inputType).addEventListener('change',UICtrl.changeType);
    };
    
    
    //Calculate and update budget
    var updateBudget = function(){
        
        //1.Calculate the budget
        budgetCtrl.calculateBudget();
        
        //2.Return the budget
        var budget = budgetCtrl.getBudget();
        
        //3.Display the budget on the UI
        UICtrl.displayBudget(budget);
    };
    
    
    //Calculate and update percentages
    var updatePercentages = function(){
        var perArr;
        //1.Calculate percentages
        budgetCtrl.calculatePercentages();
        
        //2.Return percentages
        perArr = budgetCtrl.getPercentages();
        
        //3.Display percentages on UI
        UICtrl.displayPercentage(perArr);    
    };
    
    
    //Getting input and adding items
    var ctrlAddItems = function(){
        var input,newItem;
        
        //1.Get input from user
        input = UICtrl.getInput();
        
        if (input.desc !== "" && !isNaN(input.value) && input.value > 0){
             
            //2.Add the item to the buget controller
            newItem = budgetCtrl.addItem(input.type,input.desc,input.value);

            //3.Add item to the UI
            UICtrl.addItemList(newItem,input.type);

            //4.Clear all input fields
            UICtrl.clearField();

            //5.Calculate and update the budget
            updateBudget();  
            
            //6.Calculate and update percentages
            updatePercentages();

            }    
    };
    
    
    //Deleting items and updating UI
    var ctrlDeleteItems = function(event){
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID){
            
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            //1.Delete the item from our data structure
            budgetCtrl.deleteItem(type, ID);
            
            //2.Delete the item from the UI
            UICtrl.deleteItemList(itemID);
            
            //3.Update the budget and show new one
            updateBudget();
            
            //4.Calculate and update percentages
            updatePercentages();

        }
    };
    
    
    //Setting all methods required to start the application to global scope
    return {    
        init: function(){
            console.log('Application has started....');
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget: 0,
                totalExp: 0,
                totalInc: 0,
                percentage: -1     
            });
            setUpEventListeners();
        }    
    };
        
})(budgetController, UIController);


//Application starting point
controller.init();
          
