class SubmitLesson {
  constructor(clss, topics, subTopics, req, res, db){
    const temp = req.body;
    this.cls = JSON.parse(temp.cls);
    this.day = JSON.parse(temp.day);
    this.description = temp.description;
    this.tags = this.sanitizeTags(this.sanitizeCSV(temp.tags));
    this.type = JSON.parse(temp.type);
    this.contentType = temp.contentType;
    this.contentURL = temp.contentURL;
    this.libraryName = (temp.libraryName === undefined) ? temp.libraryName : this.sanitizeCSV(temp.libraryName);
    this.functionInstance = (temp.functionInstance === undefined) ? temp.functionInstance : this.sanitizeCSV(temp.functionInstance);
    this.root = db.collection(this.cls).doc(this.day);
    this.qsList = db.collection(this.cls).doc(`${this.cls}_qs`);
    this.tagsListRoot = db.collection("tags").doc("tagsList");
    this.qString = `${topics[this.type]}.${subTopics[this.contentType]}.${clss[this.cls]}`;
    this.qsList.get().then(doc => {
      this.currentQueryStrings = doc.data();
      this.qString += this.findOrder(doc);
      this.subRoot = this.root.collection("resources").doc(this.qString);
      return (this.root.get());
    }).then(doc => {
      if(!doc.exists){
        this.root.set({description: `${this.cls} Day ${this.day}` }).catch(error => {
          console.log(`Failed to set the description for collection ${this.cls} on day ${this.day}`);
          console.log(error);
          var response = `There was an error inputting the lesson. Please try again`;
          res.send({ res: response, code: 9, qString: this.qString });
        });
      }
      return (this.subRoot.set({ description: this.description, tags: this.tags }));
    }).then(snapshot => {
      this.displaySuccessMessage(`Resource`, snapshot);
      const data = this.setDataObject(`type`, this.contentType, this.contentURL);
      return (this.subRoot.collection("content").doc(this.qString).set(data))
    }).then(snapshot => {
      this.displaySuccessMessage(`Content`, snapshot);
      const data = this.setDataObject(`name`, this.libraryName);
      return (this.subRoot.collection("library").doc(this.qString).set(data));
    }).then(snapshot => {
      this.displaySuccessMessage(`Library`, snapshot);
      const data = this.setDataObject(`instance`, this.functionInstance);
      return (this.subRoot.collection("functions").doc(this.qString).set(data))
    }).then(snapshot => {
      this.displaySuccessMessage(`Functions`, snapshot);
      this.qsList.set({
        queryString: [...this.currentQueryStrings.queryString, { qString: this.qString, day: this.day }]
      }).catch(error => {
        console.log(`Failed to update queryString`);
        res.send({
          res: `Failed to update the queryString. This lesson will not be able to searched for or updated.`,
          code: 10,
          qString: this.qString
        });
      });
      return (this.tagsListRoot.get());
    }).then(doc => {
      const newTags = this.updateTagsList(doc.data(), this.tags);
      this.tagsListRoot.set({
        list: newTags.list
      })
    }).then(snapshot => {
      this.displaySuccessMessage(`tags`, snapshot);
      res.send({
        res: `Lesson was submitted correctly. The query string of the submitted lesson is: ${this.qString}`,
        code: 1,
        qString: this.qString
      })
    }).catch(error => {
      console.log(`There was an error at some point in time... I don't know...gotta update this`);
      console.log(error);
      res.send({
        res: `There was an error bro...I dont know where`,
        code: 2,
        qString: this.qString
      });
    });
  }

  sanitizeCSV(csv) {
    return csv.split(',');
  }

  sanitizeTags(tags) {
    return tags.map((tag, index) => {
      if (tag.charAt(0) === "\"" || tag.charAt(0) === " ") {
        if (index === tags.length - 1) {
          return tag.substring(1, tag.length - 1);
        }
        return tag.substring(1);
      }
      if (index === tags.length - 1 && tag.charAt(0) !== " ") {
        return tag.substring(0, length - 1);
      }
      return tag
    });
  }

  findOrder(doc) {
    const currentQueryStrings = doc.data();
    const similarTypes = this.sanitizeQueryStrings(currentQueryStrings);
    const order = similarTypes.length + 1;
    return (similarTypes.length >= 10) ? `.${order}` :
      (similarTypes.length > 0) ? `.0${order}` : `.01`;
  }

  displaySuccessMessage(type, snapshot) {
    if (type === "tags") {
      console.log("Added to the tags list:")
      console.log(snapshot);
      return;
    }
    console.log(`${type} collection has been succesfully set:`);
    console.log(snapshot);
  }

  setDataObject(type, prop1, prop2) {
    const data = {};
    if (prop1 !== undefined) {
      data.present = true;
      data[type] = prop1;
      if (prop2 !== undefined) data.url = prop2;
    } else {
      data.present = false;
    }
    return data;
  }

  updateTagsList(oldTags, newTags) {
    newTags.forEach(tag => {
      if (oldTags.list[tag] === undefined) {
        const temp = [];
        temp.push(this.qString);
        oldTags.list[tag] = temp;
      } else {
        oldTags.list[tag].push(this.qString);
      }
    });
    return oldTags;
  }
}