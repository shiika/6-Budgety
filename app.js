// Implementing Module Pattern to seperate our concerns and encapsulate our module function and data, also properly expose it to other modules

// Budget Controller:
// 1.Control data structures of our budget
// 2.Calculate our incomes, expenses and overall budget
var budgetController = (() => {

    class Expense {
        constructor(id, desc, value, percentage = 0) {
            this.id = id;
            this.desc = desc;
            this.value = value;
            this.percentage = percentage
        }

        calculatePercentage() {
            this.percentage = Math.round((this.value / data.totals["exp"]) * 100);
        }
    }

    class Income extends Expense {
        constructor(id, desc, value, percentage = 0) {
            super(id, desc, value, percentage)
        }

        calculatePercentage() {
            this.percentage = Math.round((this.value / data.totals["inc"]) * 100);
        }
    }

    var calculateTotals = type => {
        data.totals[type] = data.allItem[type].reduce((total, item) => {
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
        addItem: input => {
                var id = data.allItem[input.type].length === 0 ? 0 : data.allItem[input.type][data.allItem[input.type].length -1].id + 1; 
                if (input.type === "inc") { var item = new Income(id, input.desc, parseFloat(input.value.toFixed(2))) }
                else if (input.type === "exp") { var item = new Expense(id, input.desc, parseFloat(input.value.toFixed(2))) }
                data["allItem"][input.type].push(item);
                // item.percentage = (item.value / data.totals[input.type]) * 100;
                return item;

        },

        calculateBudget: type => {
            calculateTotals(type);
            
            data.budget = data.totals["inc"] - data.totals["exp"];

            if (data.totals["inc"] > data.totals["exp"]) {
                data.percentage = Math.round((data.totals["exp"] / data.totals["inc"]) * 100);
            }
        },

        calculatePercentages: type => {

            data.allItem[type].forEach(item => item.calculatePercentage());

            return data.allItem[type].map(item => item.percentage)

        },

        deleteItem: function(type, id) {
            // assume ids = [0 1 2 3]
            var ids = data.allItem[type].map(item => {
                return item.id
            });

            index = ids.indexOf(id);

            data.allItem[type].splice(index, 1);

            return data.allItem[type]
        },

        getItems: type => {
            return data.allItem[type];
        },

        getBudget: () => {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        budgetStatus: () => {
            return data
        }
    }

})();

// UI Controller:
// 1.Controlling UI of overall budget, incomes and expenses
var UIController = (() => {

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

    var numberWithCommas = number => {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    // Public 
    return {
        getUIComponents: () => {
            return UIComponents
        },

        getInput: () => {
            var description = UIComponents["descField"];
            var inputValue = UIComponents["valueField"];

                return {
                    desc: description.value,
                    value: parseFloat(inputValue.value),
                    type: UIComponents["typeField"].value
                }
                
        },

        changeUI: e => {
            var container = UIComponents["addContainer"];
            container.querySelectorAll("input, select").forEach(item => {
                item.classList.toggle("red-focus");
            });
            container.querySelector(".add__btn").classList.toggle("red");
        },

        displayItem: item => {
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

        clearFields: () => {
            UIComponents.inputFields.forEach(item => {
                item.value = "";
            });

            UIComponents.inputFields[0].focus();
        },

        displayBudget: data => {
            UIComponents["totalBudget"].innerHTML = numberWithCommas(data.budget);
            UIComponents["totalIncomes"].innerHTML = numberWithCommas(data.totalInc);
            UIComponents["totalExpenses"].innerHTML = numberWithCommas(data.totalExp);
            UIComponents["totalPercentage"].innerHTML = `${data.percentage}%`;
        },

        displayPercentages: (percentages, type) => {
            percentages.forEach((item, index) => {
                var itemContainer = UIComponents[type === "inc" ? "incomeItems" : "expenseItems"].querySelectorAll(".item");

                itemContainer[index].querySelector(".item__percentage").innerHTML = `${parseInt(item).toString()}%`;

            })

        },

        removeItem: (type, id) => {
            var item = UIComponents["container"].querySelector(`#${type}-${id}`);
            item.parentNode.removeChild(item);
        }
    }
})();

// Core Controller
// 1.Merging both modules and make use of them both
// 2.Controlling event handlers
var controller = ((budgetCtrl, UICtrl) => {

    var setupEventHandlers = () => {

        // Adding an item event handlers
        DOM["inputBtn"].addEventListener("click", ctrlAddItem);
        document.addEventListener("keypress", ctrlAddItem);

        // Deleting an item event handler
        DOM["container"].addEventListener("click", ctrlDeleteItem);

        // Change type event handler
        DOM["typeField"].addEventListener("change", UICtrl.changeUI);

    }
    var DOM = UICtrl.getUIComponents();

    var displayDate = () => {
        var now = new Date();
        var monthsName = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        var month = monthsName[now.getMonth()];
        DOM["monthElement"].innerHTML = month;
    };

    var updateBudget = type => {

        // 1. Calculate Budget
        budgetCtrl.calculateBudget(type);

        // 2. Return Budget
        var budget = budgetCtrl.getBudget()

        // 3. Display budget on UI
        UICtrl.displayBudget(budget)

    };

    var updatePercentages = type => {

        // 1. Calculate items percetnages and update budget
        var percentages = budgetCtrl.calculatePercentages(type);

        // 2. update items percentages on UI
        UICtrl.displayPercentages(percentages, type);
        
    };

    var ctrlAddItem = e => {

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
                updatePercentages(input.type);
                

                // 6. Clear Input Fields
                UICtrl.clearFields();
            }
            
        }

    };

    var ctrlDeleteItem = e => {
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
        updatePercentages(type);
        
        
    }

    return {
        init: () => {
            displayDate();
            UICtrl.displayBudget(budgetCtrl.getBudget());
            setupEventHandlers()
        }
    }

})(budgetController, UIController);

controller.init();