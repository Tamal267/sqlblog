const express = require("express");
const oracledb = require("oracledb");
const cors = require("cors");
require("dotenv").config();
const { connection, runQuery } = require("./connection");

const app = express();
app.use(cors());

oracledb
  .getConnection({
    user: process.env.USR,
    password: process.env.PASSWORD,
    connectString: process.env.CONNECTION_STRING,
  })
  .then(() => {
    console.log(`database connected on port ${process.env.PORT}`);
  })
  .catch((e) => {
    console.log(e);
  });

app.listen(process.env.PORT, () => {
  console.log("listening");
});

app.use(express.json());

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

app.get("/", async (req, res) => {
  const blogs = await runQuery("SELECT * FROM blog", {});
  if (blogs.length) {
    res.status(200).json(blogs);
  } else {
    res.status(404).json({ error: "Empty blog" });
  }
});

app.get("/:id", async (req, res) => {
  const { id } = req.params;
  const blog = await runQuery("SELECT * FROM blog WHERE blogid=:id", {
    id,
  });
  if (blog.length) {
    res.status(200).json(blog[0]);
  } else {
    res.status(404).json({ error: "No such blog" });
  }
});

app.post("/", async (req, res) => {
  const { title, blogBody } = req.body;
  try {
    const data = await runQuery(
      "INSERT INTO blog(title, blogbody) VALUES(:title, :blogBody)",
      {
        title,
        blogBody,
      }
    );
    const blog = await runQuery(
      "SELECT * FROM (SELECT * FROM blog WHERE title=:title ORDER BY blogid DESC) WHERE ROWNUM <= 1",
      {
        title,
      }
    );
    res.status(200).json(blog);
  } catch (e) {
    res.status(404).json({ error: "Error occured" });
  }
});

app.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const blog = await runQuery("SELECT * FROM blog WHERE blogid=:id", {
    id,
  });
  const data = await runQuery("DELETE FROM blog WHERE blogid=:id", {
    id,
  });
  if (blog.length) {
    res.status(200).json(blog[0]);
  } else {
    res.status(404).json({ error: "No such blog" });
  }
});
