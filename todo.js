var state = [];

function setDefaultState() {
    var id = generateID();
    var baseState = {};
    baseState[id] = {
        id: id,
        title: "NewTask",
        desc: "We use 🍪 to keep track of your tasks",
        dueDate: "25/02/2022",
        status: "inserted"
    };
    syncState(baseState);
}

function generateID() {
    var randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    return randLetter + Date.now();
}

function pushToState(id, title, desc, dueDate, status) {
    var baseState = getState();
    baseState[id] = {
        id,
        title,
        desc,
        dueDate,
        status
    };
    syncState(baseState);
}

// function setToDone(id) {
//     var baseState = getState();
//     if (baseState[id].status === 'inserted') {
//         baseState[id].status = ''
//     }
//     if (baseState[id].status === 'inprogress') {
//         baseState[id].status = 'completed'
//     }
//     if (baseState[id].status === 'completed') {
//         baseState[id].status = 'inserted'
//     }
//     syncState(baseState);
// }

function deleteTodo(id) {
    console.log(id)
    var baseState = getState();
    delete baseState[id]
    syncState(baseState)
}

function resetState() {
    localStorage.setItem("state", null);
}

function syncState(state) {
    localStorage.setItem("state", JSON.stringify(state));
}

function getState() {
    return JSON.parse(localStorage.getItem("state"));
}

function addItem(title, desc, dueDate, status, id, noUpdate) {
    var id = id ? id : generateID();
    //var c = status === "inserted" ? "danger" : "";    
    var item =
        '<li data-id="' +
        id +
        '" class="animated flipInX ' +
        status +
        '"><div class="checkbox"><span class="close delete"><i class="fa fa-times"></i></span><span class="close edit" style="right:50px !important"><i class="fa fa-edit"></i></span><label><span class="checkbox-mask"></span><input type="checkbox" />' +
        title + desc + dueDate +
        "</label></div></li>";

    var itemDone =
        '<li data-id="' +
        id +
        '" class="danger animated flipInX s' +
        status +
        '"><div class="checkbox"><span class="close delete"><i class="fa fa-times"></i></span><span class="close edit" style="right:50px !important"><i class="fa fa-edit"></i></span><label><span class="checkbox-mask"></span><input type="checkbox" />' +
        title + desc + dueDate +
        "</label></div></li>";

    var isError = $(".form-control").hasClass("hidden");

    if (title === "" || desc === "" || dueDate === "") {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Insert a task!',
            showConfirmButton: false,
            timer: 2500
        })
        return
    } else {
        $(".err").addClass("hidden");
        if (status === "inserted") {
            $("#todo-list-inserted").append(item);
        }
        if (status === "inprogress") {
            $("#todo-list-inprogress").append(item);
        }
        if (status === "completed") {
            $("#todo-list-completed").append(itemDone);
        }
    }

    $(".no-items").addClass("hidden");

    $(".todotitle").val("")
    $(".tododesc").val("")
    $(".tododuedate").val("")
    setTimeout(function() {
        $(".todo-list li").removeClass("animated flipInX");
    }, 500);

    if (!noUpdate && title !== "" && desc !== "" && dueDate !== "") {
        pushToState(id, title, desc, dueDate, status);
    }
}

function refresh(li) {

    li.delay(70)
        .queue(function() {
            $(this).addClass("animated flipOutX");
            $(this).dequeue();
        });

    setTimeout(function() {
        li.remove();
        $(".no-items").removeClass("hidden");
        $(".err").addClass("hidden");
    }, 800);

    setTimeout(() => {
        var id = li.data().id
        var statez = getState();

        if (!statez) {
            setDefaultState();
            statez = getState();
        }

        var x = statez[id]

        addItem(statez[id].title, statez[id].desc, statez[id].dueDate, statez[id].status, statez[id].id, true);

    }, 800);
}



function initDatePicker() {
    if (document.querySelector(".datepick")) {
        flatpickr(".datepick", {
            allowInput: true,
            locale: "it",
            altInput: true,
            altFormat: "d/m/Y",
            dateFormat: "d/m/Y",
            //defaultDate: "today"
        });
    }
}

function updateOneTask() {
    var id = $('.id-m').val()
    var title = $('.title-m').val()
    var desc = $('.desc-m').val()
    var dueDate = $('.duedate-m').val()
    var status = $('.status-m').val()

    var baseState = getState()
    baseState[id].title = title
    baseState[id].desc = desc
    baseState[id].dueDate = dueDate
    baseState[id].status = status
    syncState(baseState)
    $('#modalEdit').modal("hide")
    location.reload()
}

function checkStatus(id) {
    var baseState = getState()
    var status = baseState[id].status
    return status
}

function getSwalDetails(status) {
    var swalDetails
    if (status === "inserted") {
        swalDetails = {
            title: "Task start!",
            desc: "Are you starting this task?",
            btn: "Yes, start it!",
            status: "inprogress"
        }
    }
    if (status === "inprogress") {
        swalDetails = {
            title: "All done!",
            desc: "Are you completing this task?",
            btn: "Yes, complete it!",
            status: "completed"
        }
    }
    if (status === "completed") {
        swalDetails = {
            title: "Switch to in progress!",
            desc: "Are you working again on this task?",
            btn: "Yes, let's work again on it!",
            status: "inprogress"
        }
    }
    return swalDetails
}

$(function() {
    var err = $(".err"),
        formControl = $(".form-control"),
        isError = formControl.hasClass("hidden");

    if (!isError) {
        formControl.blur(function() {
            err.addClass("hidden");
        });
    }

    $(".add-btn").on("click", function() {
        var title = $(".todotitle").val();
        var desc = $(".tododesc").val();
        var dueDate = $(".tododuedate").val();
        var itemVal = {
            title,
            desc,
            dueDate
        }
        addItem(itemVal.title, itemVal.desc, itemVal.dueDate, "inserted");
        formControl.focus();
    });

    $(".todo-list").on("click", 'input[type="checkbox"]', function() {
        var box = $(this)
            .parent()
            .parent()
            .parent();

        var id = box.data().id

        var statusCheck = checkStatus(id);

        var swalDetails = getSwalDetails(statusCheck);

        var li = $(this)
            .parent()
            .parent()
            .parent();
        li.toggleClass("danger");
        li.toggleClass("animated flipInX");

        setTimeout(function() {
            li.removeClass("animated flipInX");
        }, 500);

        Swal.fire({
            title: swalDetails.title,
            text: swalDetails.desc,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: swalDetails.btn
        }).then((result) => {
            if (result.isConfirmed) {
                var baseState = getState()
                baseState[id].status = swalDetails.status
                syncState(baseState)
                refresh(li)

            } else {
                li.toggleClass("danger");
                li.toggleClass("animated flipInX");

                setTimeout(function() {
                    li.removeClass("animated flipInX");
                }, 500);
            }
        })
    });

    $(".todo-list").on("click", ".delete", function() {

        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                var box = $(this)
                    .parent()
                    .parent();
                if ($(".todo-list li").length == 1) {
                    box.removeClass("animated flipInX").addClass("animated                flipOutX");
                    setTimeout(function() {
                        box.remove();
                        $(".no-items").removeClass("hidden");
                    }, 500);
                } else {
                    box.removeClass("animated flipInX").addClass("animated flipOutX");
                    setTimeout(function() {
                        box.remove();
                    }, 500);
                }

                deleteTodo(box.data().id)
            }
        })
    });

    $(".todo-list").on("click", ".edit", function() {
        $('#modalEdit').modal("show")
        var id = $(this)
            .parent()
            .parent()
            .data().id

        var baseState = getState();

        var title = baseState[id].title
        var desc = baseState[id].desc
        var dueDate = baseState[id].dueDate
        var status = baseState[id].status

        $('.id-m').val(id)
        $('.title-m').val(title)
        $('.desc-m').val(desc)
        $('.duedate-m').val(dueDate)
        $('.status-m').val(status)
    });

    // $(".todoitem").keypress(function (e) {
    //     if (e.which == 13) {
    //         var itemVal = $(".todoitem").val();
    //         addItem(itemVal.title, itemVal.desc, itemVal.dueDate, "inserted");
    //     }
    // });
    // $(".todo-list").sortable();
    // $(".todo-list").disableSelection();
});

var todayContainer = document.querySelector(".today");


var d = new Date();


var weekday = new Array(7);
weekday[0] = "Sunday 🖖";
weekday[1] = "Monday 💪😀";
weekday[2] = "Tuesday 😜";
weekday[3] = "Wednesday 😌☕️";
weekday[4] = "Thursday 🤗";
weekday[5] = "Friday 🍻";
weekday[6] = "Saturday 😴";


var n = weekday[d.getDay()];


var randomWordArray = Array(
    "Oh my, it's ",
    "Whoop, it's ",
    "Happy ",
    "Seems it's ",
    "Awesome, it's ",
    "Have a nice ",
    "Happy fabulous ",
    "Enjoy your "
);

var randomWord =
    randomWordArray[Math.floor(Math.random() * randomWordArray.length)];


todayContainer.innerHTML = randomWord + n;

$(document).ready(function() {

    initDatePicker();

    var state = getState();

    if (!state) {
        setDefaultState();
        state = getState();
    }

    Object.keys(state).forEach(function(todoKey) {
        var todo = state[todoKey];
        addItem(todo.title, todo.desc, todo.dueDate, todo.status, todo.id, true);
    });

    var mins, secs, update;

    init();

    function init() {
        (mins = 25), (secs = 59);
    }


    set();

    function set() {
        $(".mins").text(mins);
    }


    $("#start").on("click", start_timer);
    $("#reset").on("click", reset);
    $("#inc").on("click", inc);
    $("#dec").on("click", dec);

    function start_timer() {

        set();

        $(".dis").attr("disabled", true);

        $(".mins").text(--mins);
        $(".separator").text(":");
        update_timer();

        update = setInterval(update_timer, 1000);
    }

    function update_timer() {
        $(".secs").text(secs);
        --secs;
        if (mins == 0 && secs < 0) {
            reset();
        } else if (secs < 0 && mins > 0) {
            secs = 59;
            --mins;
            $(".mins").text(mins);
        }
    }


    function reset() {
        clearInterval(update);
        $(".secs").text("");
        $(".separator").text("");
        init();
        $(".mins").text(mins);
        $(".dis").attr("disabled", false);
    }


    function inc() {
        mins++;
        $(".mins").text(mins);
    }


    function dec() {
        if (mins > 1) {
            mins--;
            $(".mins").text(mins);
        } else {
            alert("This is the minimum limit.");
        }
    }
});