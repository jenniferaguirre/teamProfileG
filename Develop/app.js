const Manager = require("./lib/Manager");
const Engineer = require("./lib/Engineer");
const Intern = require("./lib/Intern");
const inquirer = require("inquirer");
const path = require("path");
const fs = require("fs");

const OUTPUT_DIR = path.resolve(__dirname, "output");
const outputPath = path.join(OUTPUT_DIR, "team.html");

const render = require("./lib/htmlRenderer");

var teamList = [];
const managerQuestions = [
    {
        type: "input",
        name: "name",
        message: "Please enter manager name:",
        validate: async (input) => {
            if (input == "" || /\s/.test(input)) {
                return "Please enter last name.";
            }
            return true;
        }
    },
    {
        type: "input",
        name: "email",
        message: "Please enter manager email:",
        validate: async (input) => {
            if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(input)) {
                return true;
            }
            return "Please enter valid email address.";
        }
    },
    {
        type: "input",
        name: "officeNumber",
        message: "Enter office number:",
        validate: async (input) => {
            if (isNaN(input)) {
                return "Please enter office number";
            }
            return true;
        }
    },
    {
        type: "list",
        name: "hasTeamMembers",
        message: "Do you have any team members?",
        choices: ["Yes", "No"]
    }
]

const employeeQuestions = [
    {
        type: "input",
        name: "name",
        message: "Please enter employee name:",
        validate: async (input) => {
            if (input == "") {
                return "Please enter last name.";
            }
            return true;
        }
    },
    {
        type: "input",
        name: "email",
        message: "Please enter employee email:",
        validate: async (input) => {
            if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(input)) {
                return true;
            }
            return "Please enter valid email address.";
        }
    },
    {
        type: "list",
        name: "role",
        message: "Please state role of employee.",
        choices: ["engineer", "intern"]
    },
    {
        when: input => {
            return input.role == "engineer"
        },
        type: "input",
        name: "Github",
        message: "Engineer, please enter Github username:",
        validate: async (input) => {
            if (input == "" || /\s/.test(input)) {
                return "Please enter valid GitHub username";
            }
            return true;
        }
    },
    {
        when: input => {
            return input.role == "intern"
        },
        type: "input",
        name: "school",
        message: "Intern, please enter name of school:",
        validate: async (input) => {
            if (input == "") {
                return "No school inputted, please insert name of school.";
            }
            return true;
        }
    },
    {
        type: "list",
        name: "addAnother",
        message: "Add another team member?",
        choices: ["Yes", "No"]
    }
]

function buildTeamList() {
    inquire.prompt(employeeQuestions).then(employeeInfo => {
        if (employeeInfo.role == "engineer") {
            var newMember = new Engineer(employeeInfo.name, teamList.length + 1, employeeInfo.email, employeeInfo.github);
        } 
        else {
            var newMember = new Intern(employeeInfo.name, teamList.length + 1, employeeInfo.email, employeeInfo.school);
        }
        teamList.push(newMember);
        if (employeeInfo.addAnother === "Yes") {
            console.log(" ");
            buildTeamList();
        } else {
            buildHtmlPage();
        }
    })
}

function buildHtmlPage() {
    let newFile = fs.readFileSync("./templates/main.html")
    fs.writeFileSync("./output/teamPage.html", newFile, function (err) {
        if (err) throw err;
    })

    console.log("Base page has been generated!");

    for (member of teamList) {
        if (member.getRole() == "Manager") {
            buildHtmlCard("manager", member.getName(), member.getId(), member.getEmail(), "Office: " + member.getOfficeNumber());
        } 
        else if (member.getRole() == "Engineer") {
            buildHtmlCard("engineer", member.getName(), member.getId(), member.getEmail(), "Github: " + member.getGithub());
        } 
        else if (member.getRole() == "Intern") {
            buildHtmlCard("intern", member.getName(), member.getId(), member.getEmail(), "School: " + member.getSchool());
        }
    }
    fs.appendFileSync("./output/teamPage.html", "</div></main></body></html>", function (err) {
        if (err) throw err;
    });
    console.log("Page tags closed! Operation has been completed.")
}

function buildHtmlCard(memberType, name, id, email, propertyValue) {
    let data = fs.readFileSync(`./templates/${memberType}.html`, 'utf8')
    data = data.replace("nameHere", name);
    data = data.replace("idHere", `ID: ${id}`);
    data = data.replace("emailHere", `Email: <a href="mailto:${email}">${email}</a>`);
    data = data.replace("propertyHere", propertyValue);
    fs.appendFileSync("./output/teamPage.html", data, err => { if (err) throw err; })
    console.log("Card has been appended");
}

function init() {
    inquire.prompt(managerQuestions).then(managerInfo => {
        let teamManager = new Manager(managerInfo.name, 1, managerInfo.email, managerInfo.officeNum);
        teamList.push(teamManager);
        console.log(" ");
        if (managerInfo.hasTeam === "Yes") {
            buildTeamList();    
        } 
        else {
            buildHtmlPage();
        }
    })
}

init();

// Write code to use inquirer to gather information about the development team members,
// and to create objects for each team member (using the correct classes as blueprints!)

// After the user has input all employees desired, call the `render` function (required
// above) and pass in an array containing all employee objects; the `render` function will
// generate and return a block of HTML including templated divs for each employee!

// After you have your html, you're now ready to create an HTML file using the HTML
// returned from the `render` function. Now write it to a file named `team.html` in the
// `output` folder. You can use the variable `outputPath` above target this location.
// Hint: you may need to check if the `output` folder exists and create it if it
// does not.

// HINT: each employee type (manager, engineer, or intern) has slightly different
// information; write your code to ask different questions via inquirer depending on
// employee type.

// HINT: make sure to build out your classes first! Remember that your Manager, Engineer,
// and Intern classes should all extend from a class named Employee; see the directions
// for further information. Be sure to test out each class and verify it generates an
// object with the correct structure and methods. This structure will be crucial in order
// for the provided `render` function to work! ```
