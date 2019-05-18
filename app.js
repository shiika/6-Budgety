// Implementing Module Pattern to seperate our concerns and encapsulate our module function and data, also properly expose it to other modules

// Budget Controller:
// 1.Control data structures of our budget
// 2.Calculate our incomes, expenses and overall budget
var budgetController = (function() {
    
    var Expense = function(id, desc, value, percentage = 0) {
        this.id = id;
        this.desc = desc;
        this.value = value;
        this.percentage = percentage
    }

    var Income = function(id, desc, value, percentage = 0) {
        this.id = id;
        this.desc = desc;
        this.value = value;
        this.percentage = percentage
    };

    var calculateTotals = function(type) {
        data.totals[type] = data.allItem[type].reduce(function(total, item) {
            return total + item.value 
        }, 0);
    }

    var data = {
        allItem: {
            inc: [],
            exp: []
        },

        totals: {
            inc: 0,
            exp: 0
        },

        budget: 0,
        percentage: 0
    }

    return {
        addItem: function(input) {
                var id = data.allItem[input.type].length === 0 ? 0 : data.allItem[input.type][data.allItem[input.type].length -1].id + 1; 
                if (input.type === "inc") { var item = new Income(id, input.desc, parseFloat(input.value.toFixed(2))) }
                else if (input.type === "exp") { var item = new Expense(id, input.desc, parseFloat(input.value.toFixed(2))) }
                data["allItem"][input.type].push(item);
                // item.percentage = (item.value / data.totals[input.type]) * 100;
                return item;

        },

        calculateBudget: function(type) {
            calculateTotals(type);
            
            data.budget = data.totals["inc"] - data.totals["exp"];

            if (data.totals["inc"] > data.totals["exp"]) {
                data.percentage = Math.round((data.totals["exp"] / data.totals["inc"]) * 100);
            }
        },

        calculatePercentages: function(expenses) {
            var percentages = expenses.map(function(expense) {
                return (expense.value / data.totals["exp"]) * 100;
            });

            data.allItem["exp"].forEach(function(item, i) {
                item.percentage = percentages[i];
            })

            return percentages
        },

        deleteItem: function(type, id) {
            // assume ids = [0 1 2 3]
            var ids = data.allItem[type].map(function(item) {
                return item.id
            });

            index = ids.indexOf(id);

            data.allItem[type].splice(index, 1);

            return data.allItem[type]
        },

        getExpenses: function() {
            return data.allItem["exp"];
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        budgetStatus: function() {
            return data
        }
    }

})();

// UI Controller:
// 1.Controlling UI of overall budget, incomes and expenses
var UIController = (function() {

    var UIComponents = {
        // Input Fields
        addContainer: document.querySelector(".add__container"),
        inputBtn: document.querySelector(".add__btn"),
        descField: document.querySelector(".add__description"),
        valueField: document.querySelector(".add__value"),
        typeField: document.querySelector(".add__type"),

        // containers
        container: document.querySelector(".container"),
        incomeItems: document.querySelector(".income__list"),
        expenseItems: document.querySelector(".expenses__list"),

        // top section
        totalBudget: document.querySelector(".budget__value"),
        totalIncomes: document.querySelector(".budget__income--value"),
        totalExpenses: document.querySelector(".budget__expenses--value"),
        totalPercentage: document.querySelector(".budget__expenses--percentage"),
        inputFields: document.querySelectorAll("input"),

        // Date month
        monthElement: document.querySelector(".budget__title--month")
    };

    var numberWithCommas = function(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    // Public 
    return {
        getUIComponents: function() {
            return UIComponents
        },

        getInput: function() {
            var description = UIComponents["descField"];
            var inputValue = UIComponents["valueField"];

                return {
                    desc: description.value,
                    value: parseFloat(inputValue.value),
                    type: UIComponents["typeField"].value
                }
                
        },

        changeUI: function(e) {
            var container = UIComponents["addContainer"];
            container.querySelectorAll("input, select").forEach(function(item) {
                item.classList.toggle("red-focus");
            });
            container.querySelector(".add__btn").classList.toggle("red");
        },

        displayItem: function(item) {
            var type = UIComponents["typeField"].value;
            var container = UIComponents[`${type === "inc" ? "incomeItems" : "expenseItems"}`];
            var div = `<div class="item clearfix" id="${type}-${item.id}">
            <div class="item__description">${item.desc}</div>
                <div class="right clearfix">
                    <div class="item__value">${type === "inc" ? "+" : "-"} ${item.value}</div>
                    <div class="item__percentage">${item.percentage}%</div>
                        <div class="item__delete">
                            <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                        </div>
                </div>
            </div>`
            
            container.insertAdjacentHTML("beforeend", div);
            
        },

        clearFields: function() {
            UIComponents.inputFields.forEach(function(item) {
                item.value = "";
            });

            UIComponents.inputFields[0].focus();
        },

        displayBudget: function(data) {
            UIComponents["totalBudget"].innerHTML = numberWithCommas(data.budget);
            UIComponents["totalIncomes"].innerHTML = numberWithCommas(data.totalInc);
            UIComponents["totalExpenses"].innerHTML = numberWithCommas(data.totalExp);
            UIComponents["totalPercentage"].innerHTML = `${data.percentage}%`;
        },

        displayPercentages: function(newExpenses) {
            newExpenses.forEach(function(item, index) {
                var itemContainer = UIComponents["expenseItems"].querySelectorAll(".item");

                itemContainer[index].querySelector(".item__percentage").innerHTML = `${parseInt(item).toString()}%`;

            })

        },

        removeItem: function(type, id) {
            var item = UIComponents["container"].querySelector(`#${type}-${id}`);
            item.parentNode.removeChild(item);
        }
    }
})();

// Core Controller
// 1.Merging both modules and make use of them both
// 2.Controlling event handlers
var controller = (function(budgetCtrl, UICtrl) {

    var setupEventHandlers = function() {

        // Adding an item event handlers
        DOM["inputBtn"].addEventListener("click", ctrlAddItem);
        document.addEventListener("keypress", ctrlAddItem);

        // Deleting an item event handler
        DOM["container"].addEventListener("click", ctrlDeleteItem);

        // Change type event handler
        DOM["typeField"].addEventListener("change", UICtrl.changeUI);

    }
    var DOM = UICtrl.getUIComponents();

    var displayDate = function() {
        var now = new Date();
        var monthsName = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        var month = monthsName[now.getMonth()];
        DOM["monthElement"].innerHTML = month;
    };

    var updateBudget = function(type) {

        // 1. Calculate Budget
        budgetCtrl.calculateBudget(type);

        // 2. Return Budget
        var budget = budgetCtrl.getBudget()

        // 3. Display budget on UI
        UICtrl.displayBudget(budget)

    };

    var updatePercentages = function() {
        // get expenses
        var expenses = budgetCtrl.getExpenses();


        // 1. Calculate expenses percetnages and update budget
        var newExpenses = budgetCtrl.calculatePercentages(expenses);


        // 2. update expenses percentages on UI
        UICtrl.displayPercentages(newExpenses);

        
    };

    var ctrlAddItem = function(e) {

        if (e.type === "click" || e.keyCode === 13) {
            // 1. Get input data
            var input = UICtrl.getInput();

            // Checking input validation
            if (input.desc != "" && !isNaN(input.value) && input.value > 0) {
                // 2. Add data to budget controller
                var item = budgetCtrl.addItem(input);
                
                // 3. Add data to UI
                UICtrl.displayItem(item);
                // console.log(item.constructor.name);
                
                // 4. Update budget
                updateBudget(input.type);

                // 5. Update expenses percentages
                updatePercentages();
                

                // 6. Clear Input Fields
                UICtrl.clearFields();
            }
            
        }

    };

    var ctrlDeleteItem = function(e) {
        var closeBtn = e.path[1];
        var item = closeBtn.parentNode.parentNode.parentNode;
        var itemId = item.id.split("-");
        var type = itemId[0];
        var id = parseInt(itemId[1]);

        // 1. Delete item from budget
        budgetCtrl.deleteItem(type, id);

        // 2. Delete item from UI
        UICtrl.removeItem(type, id);

        // 3. Update budget
        updateBudget(type);

        // 4.update percentages
        updatePercentages();
        
        
    }

    return {
        init: function() {
            displayDate();
            UICtrl.displayBudget(budgetCtrl.getBudget());
            setupEventHandlers()
        }
    }

})(budgetController, UIController);

controller.init();