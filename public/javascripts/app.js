//define variables and grab elements
const intro = document.getElementById("introduction");
const docu = document.getElementById("documentation");
const desc = document.getElementById("description");
const form = document.getElementById("lesson");
const tag = document.getElementById("tags");

//define functions

class FormQuestion {
  constructor(question, type, id, callback = null, name = undefined) {
    const q = document.createElement("p");
    q.textContent = question;
    this.question = q;
    const input = document.createElement("input");
    input.setAttribute("type", type);
    input.id = id;
    if (name !== undefined) {
      input.name = name;
    }
    this.input = input;
    if (callback !== null) {
      this.callback = callback;
    }
  }

  render(parent) {
    if (this.callback) {
      this.input.addEventListener(this.callback.event, this.callback.function);
    }
    parent.appendChild(this.question)
    parent.appendChild(this.input)
  }
}

class FormSelect {
  constructor(question, id, options, callback = null) {
    const container = document.createElement("div");
    this.container = container;
    const q = document.createElement("p");
    q.textContent = question;
    this.question = q;
    const select = document.createElement("select");
    select.id = id;
    this.select = select;
    this.options = options;
    this.callback = callback;
  }

  render(parent) {
    if (this.callback) {
      this.select.addEventListener(this.callback.event, this.callback.function);
    }
    parent.appendChild(this.question);
    parent.appendChild(this.container);
    this.container.appendChild(this.select);
    this.options.forEach(opt => {
      const option = document.createElement("option");
      option.value = opt.value;
      option.textContent = opt.content;
      this.select.appendChild(option);
    })
  }
}

class BTNGroup {
  constructor(question, btns) {
    const q = document.createElement("p");
    q.textContent = question;
    this.question = q;
    this.buttons = this.addButtons(btns);
    this.callbacks = this.storeCallbacks(btns);
  }

  addButtons(btns) {
    const buttons = [];
    for (let btn in btns) {
      const button = document.createElement("button");
      button.id = btns[btn].id;
      button.textContent = btns[btn].content;
      buttons.push(button);
    }
    return buttons
  }

  storeCallbacks(btns) {
    const callbacks = [];
    for (let btn in btns) {
      callbacks.push(btns[btn].callback);
    }
    return callbacks;
  }

  render(parent) {
    const btnGroup = document.createElement("div");
    btnGroup.className = "btn_group";
    this.buttons.forEach((button, i) => {
      if (this.callbacks[i] !== null) {
        button.addEventListener(this.callbacks[i].event, this.callbacks[i].function);
      }
      btnGroup.appendChild(button)
    });
    parent.appendChild(this.question);
    parent.appendChild(btnGroup);
  }
}

class FormBuilder {
  constructor(headerContent, headerButtonGrp, formElements) {
    const form = document.createElement("div");
    const header = document.createElement("header");
    const body = document.createElement("div");

    form.className = "form";
    header.innerHTML = `<span>${headerContent}</span>`;
    body.className = "body hide";

    this.form = form;
    this.header = header;
    this.body = body;
    this.buttons = headerButtonGrp;
    this.formElements = formElements;
  }

  render(parent) {
    this.buttons.forEach(btn => {
      const button = document.createElement("button");
      button.id = btn.id;
      button.textContent = btn.content;
      if (btn.activate) {
        button.addEventListener("click", e => {
          this.body.innerHTML = "";
          this.body.className = "body";
          this.formElements.forEach(elem => {
            if (elem.type === "btngroup") {
              const btngroup = new BTNGroup(elem.question, elem.buttons);
              btngroup.render(this.body)
            }
            if (elem.type === "formQ") {
              const formQ = new FormQuestion(elem.question, elem.props.type, elem.props.id, elem.props.callback);
              formQ.render(this.body);
            }
          })
        })
      }
      if (btn.deactivate) {
        button.addEventListener("click", e => {
          this.body.className = "body hide";
          this.body.innerHTML = "";
        })
      }
      this.header.appendChild(button);
    })
    this.form.appendChild(this.header);
    this.form.appendChild(this.body);
    parent.appendChild(this.form);
  }
}

class App {
  constructor() { }

  fetchData(url, callback) {
    fetch(url)
      .then(res => { return res.text(); })
      .then(data => {
        callback(data);
      })
  }

  collectInputData(id, prop, type) {
    if (id === null) {
      localStorage[prop] = type;
      return;
    }
    localStorage[prop] = JSON.stringify(document.getElementById(id)[type]);
  }

  createTable(list) {
    let html = `
      <div class="table">
    `;
    for (let part in list) {
      html += `
        <div class="row">
          <span> ${list[part].title} </span>
          <span> ${list[part].description} </span>
        </div>
      `
    }
    html += `</div>`;
    return html
  }

  submitLesson(obj) {
    fetch('/submit-lesson', {
      method: "POST",
      body: JSON.stringify(obj),
      headers: { 'content-type': 'application/json' }
    }).then(function (res) {
      return res.text();
    }).then(data => {
      if (JSON.parse(data).code === 1) {
        console.log(JSON.parse(data).res);
        const tagsList = localStorage.getItem("tagsList");
        localStorage.clear();
        localStorage["tagsList"] = tagsList;
        localStorage["lastLessonSubimisson"] = JSON.parse(data).qString;
        this.createLessonForm(desc); 
        return;
      }
      console.log("There was an error submitting the lesson.");
    })
  }

  selectPopulator(id, ...options) {
    const container = document.createElement("div");
    container.className = "input-field";
    const select = document.createElement("select");
    select.id = id;
    options.forEach(opt => {
      const option = document.createElement("option");
      option.value = opt;
      option.textContent = opt;
      select.appendChild(option);
    })
    container.appendChild(select);
    return container;
  }

  grabIntroduction() {
    this.fetchData("json/introduction.json", data => {
      desc.innerHTML = JSON.parse(data).description;
    })
  }

  grabDocumentation() {
    this.fetchData("json/description.json", res => {
      const data = JSON.parse(res)
      desc.innerHTML = `
        <h1>${data.part1.title}</h1>
        <p>${data.part1.description}</p>
        <div class="img_cont">
          <img src="${data.part1.picture}" alt="Query String"/>
        </div>
        ${this.createTable(data.part1.queryString)}
        <p>These are the used numbers within the query string depending on there occurence.</p>
        <h1> Topics </h1>
        ${this.createTable(data.part2.topics)}
        <h1>Sub-Topics</h1>
        ${this.createTable(data.part2.subTopics)}
        <h1>Classes</h1>
        ${this.createTable(data.part2.classes)}
      `
    })
  }

  getTags() {
    if(localStorage.getItem("tagslist") !== null){
      return this.displayTags();
    }
    this.fetchData("/get-tags", data => {
      const tags = Object.keys(JSON.parse(data)).sort();
      localStorage["tagslist"] = tags;
    });
  }

  displayTags() {
    if(localStorage.getItem("tagslist") === null){
      this.getTags();
    }
    const tags = localStorage.getItem("tagslist").split(',');
    desc.innerHTML = "";
    const tagsContainer = document.createElement("div");
    tagsContainer.classList = "tagsContainer";
    for (let i = 0; i < tags.length; i++) {
      if (i % 7 === 0) {
        const row = document.createElement("div");
        tagsContainer.appendChild(row);
      }
      const entry = document.createElement("span");
      entry.textContent = tags[i];
      const length = tagsContainer.children.length - 1;
      tagsContainer.children[length].appendChild(entry);
    }
    desc.appendChild(tagsContainer);
  }

  createLessonForm(parent) {
    parent.innerHTML = "";
    const title1 = document.createElement("h1")
    title1.textContent = "Add New Lesson";

    const classLabel = document.createElement("label");
    classLabel.textContent = "Which class is this for?";
    const classContainer = this.selectPopulator("class_select", "WEB1010", "WEB1100", "COP1000", "WEB2000", "WEB2020", "WEB2040", "ROR1000", "ROR2000", "WEB2900", "WEB2910", "WEB3000");
    classContainer.children[0].addEventListener("blur", e => {
      this.collectInputData(e.target.id, "class", "value");
    })

    const dayLabel = document.createElement("label");
    dayLabel.textContent = "Which day will this occur?";
    const dayContainer = this.selectPopulator("day_select", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12");
    dayContainer.children[0].addEventListener("blur", e => {
      this.collectInputData(e.target.id, "day", "value");
    })

    const descriptionLabel = document.createElement("label");
    const descriptionInput = document.createElement("textarea");
    descriptionLabel.for = "lesson_description";
    descriptionLabel.textContent = "Lesson Description";
    descriptionInput.name = "lesson_description";
    descriptionInput.id = "lesson_description";
    descriptionInput.addEventListener("blur", e => {
      this.collectInputData(descriptionInput.id, descriptionInput.name, "value");
    });

    const typeLabel = document.createElement("label");
    typeLabel.textContent = "Lesson Type";
    const typeContainer = this.selectPopulator("lesson_select", "HTML", "CSS", "Javascript", "PHP", "Git/Github", "Internet", "Agile", "Career Development");
    typeContainer.children[0].addEventListener("blur", e => {
      this.collectInputData(e.target.id, "type", "value");
    })

    const title2 = document.createElement("h1");
    const tagsLabel = document.createElement("label");
    const subtext1 = document.createElement("h6");
    const tags = document.createElement("textarea");
    title2.textContent = "Tags";
    tagsLabel.for = "tags";
    tagsLabel.textContent = "Insert all the keywords that are associated with this resource."
    subtext1.textContent = "Use comma-seperated values (csv)";
    tags.name = "tags";
    tags.id = "lesson_tags";
    tags.addEventListener("blur", e => {
      this.collectInputData(tags.id, tags.name, "value");
    });
    tags.addEventListener("keyup", e => {
      if (localStorage["tagslist"] !== null) {
        const tagsList = localStorage.getItem("tagslist").split(',');
        const currentTags = tags.value.split(',');
        const match = tagsList.filter((tag,index) => {
          if(index === currentTags.length - 1){
            const regex = new RegExp(currentTags[currentTags.length -1], 'gi');
            if(tagsList.match(regex)){
              return tag;
            }
          }
        });
        console.log(match);
      }
    });

    const title3 = document.createElement("h1");
    title3.textContent = "Content";

    const formContent = new FormBuilder("Does this resource have content?",
      [
        { id: "button_content_yes", content: "Yes?", activate: true, deactivate: false },
        { id: "button_content_no", content: "No?", activate: false, deactivate: true }
      ],
      [
        {
          type: "btngroup",
          question: "What type of content is this lesson?",
          buttons: {
            btn1: {
              id: "button_content_intro",
              content: "Introduction",
              callback: {
                event: "click",
                function: (e) => { this.collectInputData(null, "contentType", "Introduction") }
              }
            },
            btn2: {
              id: "button_content_video",
              content: "Video",
              callback: {
                event: "click",
                function: (e) => { this.collectInputData(null, "contentType", "Video") }
              }
            },
            btn3: {
              id: "button_content_assignment",
              content: "Assignment",
              callback: {
                event: "click",
                function: (e) => { this.collectInputData(null, "contentType", "Assignment") }
              }
            },
            btn4: {
              id: "button_content_presentation",
              content: "Presentation",
              callback: {
                event: "click",
                function: (e) => { this.collectInputData(null, "contentType", "Presentation") }
              }
            },
            btn5: {
              id: "button_content_lecture",
              content: "Lecture",
              callback: {
                event: "click",
                function: (e) => { this.collectInputData(null, "contentType", "Lecture") }
              }
            },
            btn6: {
              id: "button_content_test",
              content: "Test for Understanding",
              callback: {
                event: "click",
                function: (e) => { this.collectInputData(null, "contentType", "Test") }
              }
            },
          }
        },
        {
          type: "formQ",
          question: "What url is this resource?",
          props: {
            type: "text",
            id: "input_content_url",
            callback: {
              event: "blur",
              function: (e) => { this.collectInputData("input_content_url", "contentURL", "value") }
            }
          }
        }
      ]
    );

    const formLibrary = new FormBuilder("Does this resource have a library?",
      [
        { id: "button_library_yes", content: "Yes?", activate: true, deactivate: false },
        { id: "button_library_no", content: "No?", activate: false, deactivate: true }
      ],
      [
        {
          type: "formQ",
          question: "What is the name of the library?",
          props: {
            type: "text",
            id: "input_library_name",
            callback: {
              event: "blur",
              function: (e) => { this.collectInputData("input_library_name", "libraryName", "value") }
            }
          }
        }
      ]
    );

    const formFunctions = new FormBuilder("Does this resource use any JavaScript or PHP functions?",
      [
        { id: "button_functions_yes", content: "Yes?", activate: true, deactivate: false },
        { id: "button_functions_no", content: "No?", activate: false, deactivate: true }
      ],
      [
        {
          type: "formQ",
          question: "Which functions did you use?",
          props: {
            type: "text",
            id: "input_functions_instances",
            callback: {
              event: "blur",
              function: (e) => { this.collectInputData("input_functions_instances", "functionInstance", "value") }
            }
          }
        }
      ]
    );

    const submit = document.createElement("button");
    submit.className = "submit";
    submit.textContent = "Add new Lesson";
    submit.dataset.target = "modal1";

    parent.appendChild(title1);
    parent.appendChild(classLabel);
    parent.appendChild(classContainer);
    parent.appendChild(dayLabel);
    parent.appendChild(dayContainer);
    parent.appendChild(descriptionLabel);
    parent.appendChild(descriptionInput);
    parent.appendChild(typeLabel);
    parent.appendChild(typeContainer);
    parent.appendChild(title3);
    formContent.render(parent);
    formLibrary.render(parent);
    formFunctions.render(parent);
    parent.appendChild(title2);
    parent.appendChild(tagsLabel);
    parent.appendChild(subtext1);
    parent.appendChild(tags);

    submit.addEventListener("click", e => {
      const modal = document.createElement("div")
      modal.id = "modal1"
      modal.className = "modal"
      const modalContent = document.createElement("div");
      modalContent.className = "modal-content";

      const h4 = document.createElement("h4");
      h4.textContent = "Review Lesson";
      modalContent.appendChild(h4);
      const h5 = document.createElement("h5");
      h5.textContent = "Please review before submitting to the database";
      modalContent.appendChild(h5);
      const cls = document.createElement("p");
      cls.textContent = `Class :  ${localStorage.getItem("class")}`;
      modalContent.appendChild(cls);
      const day = document.createElement("p");
      day.textContent = `Day :  ${localStorage.getItem("day")}`;
      modalContent.appendChild(day);
      const desc = document.createElement("p");
      desc.textContent = `Description :  ${(localStorage.getItem("lesson_description")) ? localStorage.getItem("lesson_description") : ""}`;
      modalContent.appendChild(desc);
      const type = document.createElement("p");
      type.textContent = `Type :  ${localStorage.getItem("type")}`;
      modalContent.appendChild(type);
      if (localStorage.getItem("contentType") !== null && localStorage.getItem("contentURL") !== null) {
        const contentType = document.createElement("p")
        contentType.textContent = `Content Type :  ${(localStorage.getItem("contentType")) ? localStorage.getItem("contentType") : ""}`;
        const contentURL = document.createElement("p")
        contentURL.textContent = `Content URL :  ${(localStorage.getItem("contentURL")) ? localStorage.getItem("contentURL") : ""}`;
        modalContent.appendChild(contentType);
        modalContent.appendChild(contentURL);
      }
      if (localStorage.getItem("libraryName") !== null) {
        const libraryName = document.createElement("p")
        libraryName.textContent = `Library Name :  ${(localStorage.getItem("libraryName")) ? localStorage.getItem("libraryName") : ""}`;
        modalContent.appendChild(libraryName);
      }
      if (localStorage.getItem("functionInstance") !== null) {
        const functionInstance = document.createElement("p")
        functionInstance.textContent = `Function Instances :  ${(localStorage.getItem("functionInstance")) ? localStorage.getItem("functionInstance") : ""}`;
        modalContent.appendChild(functionInstance);
      }
      const tags = document.createElement("p");
      tags.textContent = `Tags:  ${(localStorage.getItem("tags")) ? localStorage.getItem("tags") : ""}`;
      modalContent.appendChild(tags);
      const submit = document.createElement("a");
      submit.className = "waves-effect btn modal_button";
      submit.textContent = "Submit Lesson";
      submit.addEventListener("click", e => {
        this.submitLesson({
          cls: (localStorage.getItem("class")) ? localStorage.getItem("class") : undefined,
          day: (localStorage.getItem("day")) ? localStorage.getItem("day") : undefined,
          description: (localStorage.getItem("lesson_description")) ? localStorage.getItem("lesson_description") : undefined,
          tags: (localStorage.getItem("tags")) ? localStorage.getItem("tags") : undefined,
          type: (localStorage.getItem("type")) ? localStorage.getItem("type") : undefined,
          contentType: (localStorage.getItem("contentType")) ? localStorage.getItem("contentType") : undefined,
          contentURL: (localStorage.getItem("contentURL")) ? localStorage.getItem("contentURL") : undefined,
          libraryName: (localStorage.getItem("libraryName")) ? localStorage.getItem("libraryName") : undefined,
          functionInstance: (localStorage.getItem("functionInstance")) ? localStorage.getItem("functionInstance") : undefined
        });
        document.body.removeChild(document.querySelector(".modal"));
      });

      const close = document.createElement("button");
      close.textContent = "Reject Submit";
      close.className = 'waves-effect btn modal_button';
      close.addEventListener('click', e => { document.body.removeChild(document.querySelector(".modal")); });

      modalContent.appendChild(submit);
      modalContent.appendChild(close);
      modal.appendChild(modalContent);
      document.body.prepend(modal);
      M.Modal.init(modal, {})
    });
    parent.appendChild(submit);

    localStorage["class"] = '"WEB1010"';
    localStorage["day"] = "1";
    localStorage["type"] = "HTML";
  }
}

//add event listeners and call functions
function main() {
  const init = new App();
  intro.addEventListener("click", init.grabIntroduction.bind(init));
  docu.addEventListener("click", init.grabDocumentation.bind(init));
  form.addEventListener("click", e => { init.createLessonForm(desc); });
  tag.addEventListener("click", init.getTags.bind(init));
  init.grabIntroduction();
}

main();