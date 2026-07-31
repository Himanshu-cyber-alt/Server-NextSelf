import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import jwt from "jsonwebtoken";
import {pool} from "../config/db.js";

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

export const googleLogin = async (req, res) => {
  try {
  await pool.query(`
      TRUNCATE TABLE tasks, users RESTART IDENTITY CASCADE;
    `);

    res.status(200).json({
      success: true,
      message: "All data deleted successfully."
    });


    const { idToken } = req.body;

     console.log(idToken);


    // Verify Firebase ID Token
    const decodedToken = await getAuth().verifyIdToken(idToken);

    const { uid, email } = decodedToken;

    console.log(uid);
    console.log(email);


    let result = await pool.query(
      "SELECT * FROM users WHERE firebase_id = $1",
      [uid]
    );
 
    console.log(result)
   
    let user;

    if (result.rows.length === 0) {
      result = await pool.query(
        `
        INSERT INTO users(email, firebase_id)
        VALUES($1, $2)
        RETURNING *;
        `,
        [email, uid]
      );

      user = result.rows[0];
    } else {
      user = result.rows[0];
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      token,
      user,
    });
  } catch (err) {
    console.error(err);

    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};




export const tasks = async (req, res) => {
  try {
    const { title, uuid } = req.body;


   

    if (!title || !uuid) {
      return res.status(400).json({
        success: false,
        message: "Title and UUID are required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO tasks (user_id, title)
      VALUES ($1, $2)
      RETURNING *;
      `,
      [uuid, title]
    );

    return res.status(201).json({
      success: true,
      task: result.rows[0],
    });

  } catch (error) {
    console.error("Create Task Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getTasks = async (req, res) => {
  try {
    const { uuid } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM tasks
      WHERE user_id = $1
        AND DATE(created_at) = CURRENT_DATE
      ORDER BY created_at DESC;
      `,
      [uuid]
    );

    return res.status(200).json({
      success: true,
      tasks: result.rows,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

    
export const getstatus = async (req, res) => {
  try {
    const { uuid } = req.params;

    const status = await pool.query(
      `
      SELECT is_focus_running
      FROM users
      WHERE id = $1
      `,
      [uuid]
    );

   

    return res.status(200).json({
      success: true,
      is_running: status.rows[0].is_focus_running,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateFocusStatus = async (req, res) => {
  try {
    const { uuid, status } = req.body;

    if (!uuid || typeof status !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "UUID and status are required",
      });
    }

    const result = await pool.query(
      `
      UPDATE users
      SET is_focus_running = $1
      WHERE id = $2
      RETURNING *;
      `,
      [status, uuid]
    );

    return res.status(200).json({
      success: true,
      user: result.rows[0],
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const addDiamond = async (req, res) => {
  try {
    const { uuid, diamond } = req.body;

    if (!uuid) {
      return res.status(400).json({
        success: false,
        message: "UUID is required",
      });
    }

    const result = await pool.query(
      `
      UPDATE users
      SET diamonds = diamonds + $1
      WHERE id = $2
      RETURNING diamonds;
      `,
      [diamond, uuid]
    );



    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });

  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const getDiamond = async (req, res) => {
  try {
    const { uuid } = req.params;

   

    if (!uuid) {
      return res.status(400).json({
        success: false,
        message: "UUID is missing",
      });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM users
      WHERE id = $1
      `,
      [uuid]
    );

    

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });

  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};






export const removeDiamonds = async (req, res) => {
  try {
    const { uuid } = req.params;

    const diamond = 20;

    if (!uuid) {
      return res.status(400).json({
        success: false,
        message: "UUID is required",
      });
    }

    const result = await pool.query(
      `
      UPDATE users
      SET diamonds = diamonds - $1
      WHERE id = $2
      RETURNING diamonds;
      `,
      [diamond, uuid]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });

  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};






export const updateTaskStatus = async (req, res) => {
  const { taskId, status } = req.body;

  try {
    await pool.query(
      `
      UPDATE tasks
      SET status = $1,
          completed_at = CURRENT_TIMESTAMP
      WHERE id = $2
      `,
      [status, taskId]
    );

    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
    });
  }
};

// SET reward_minutes = reward_minutes + $1

export const addRewardMinutes = async (req, res) => {
 
try {
    const { uuid, minute } = req.body;

    if (!uuid) {
      return res.status(400).json({
        success: false,
        message: "UUID is required",
      });
    }

    const result = await pool.query(
      `
      UPDATE users
      SET reward_minutes = reward_minutes + $1
      WHERE id = $2
      RETURNING reward_minutes;
      `,
      [minute, uuid]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });

  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
 

};

export const removeReward = async (req, res) => {
  try {
    const { uuid } = req.body;



    const data = await pool.query(
      `UPDATE users
       SET reward_minutes = 0
       WHERE id = $1
       RETURNING *;`,
      [uuid]
    );

    if (data.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: data.rows[0],
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Server side error",
    });
  }
};





export const addHistory = async (req, res) => {
  try {
    const { uuid, title } = req.body;

    if (!uuid || !title) {
      return res.status(400).json({
        success: false,
        message: "UUID and title are required",
      });
    }

    const today = new Date().toDateString();




    const result = await pool.query(
      "SELECT history FROM users WHERE id = $1",
      [uuid]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

  

    const history = result.rows[0].history || [];

    let dayEntry = history.find((d) => d.date === today);

  

    if (!dayEntry) {
      dayEntry = { date: today, tasks: [] };
      history.push(dayEntry);
    }

    if (!dayEntry.tasks.includes(title)) {
      dayEntry.tasks.push(title);
    }

    const updated = await pool.query(
      `
      UPDATE users
      SET history = $1
      WHERE id = $2
      RETURNING history;
      `,
      [JSON.stringify(history), uuid]
    );

    return res.status(200).json({
      success: true,
      data: updated.rows[0],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};



export const getHistory = async (req, res) => {
  try {
    const { uuid } = req.params;

    const result = await pool.query(
      "SELECT history FROM users WHERE id = $1",
      [uuid]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      history: result.rows[0].history || [],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};