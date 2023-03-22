const { expect } = require("chai");

describe("TodoList", function() {
  it("should create a new task", async function() {
    const TodoList = await ethers.getContractFactory("TodoList");
    const todoList = await TodoList.deploy();

    await todoList.createTask("A new task");

    const task = await todoList.tasks(1);
    expect(task.id).to.equal(1);
    expect(task.content).to.equal("A new task");
    expect(task.completed).to.equal(false);
  });

  it("should toggle task completion", async function() {
    const TodoList = await ethers.getContractFactory("TodoList");
    const todoList = await TodoList.deploy();

    await todoList.createTask("A new task");
    await todoList.toggleCompleted(1);

    const task = await todoList.tasks(1);
    expect(task.completed).to.equal(true);

    await todoList.toggleCompleted(1);

    const updatedTask = await todoList.tasks(1);
    expect(updatedTask.completed).to.equal(false);
  });
});
