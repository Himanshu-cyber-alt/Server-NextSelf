import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import jwt from "jsonwebtoken";
import {pool} from "../config/db.js";
import { Resend } from 'resend';






const resend = new Resend(process.env.RESEND_API_KEY);

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

// --- Add this near the top of your file ---



export const googleLogin = async (req, res) => {  


  try {
    const { idToken } = req.body;

   
  

    // Verify Firebase ID Token
    const decodedToken = await getAuth().verifyIdToken(idToken);

    const { uid, email } = decodedToken;

 

   
console.log("Testing database connection...");

const test = await pool.query("SELECT NOW()");
console.log("Database connected:", test.rows);

console.log("Firebase UID:", uid);

    let result = await pool.query(
      "SELECT * FROM users WHERE firebase_id = $1",
      [uid]
    );

   
console.log("result ===> ", result)
   
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
     console.error("========== FIREBASE ERROR ==========");
  console.error(err);
  console.error("Message:", err.message);
  console.error("Code:", err.code);
  console.error("Stack:", err.stack);

  return res.status(500).json({
    success: false,
    message: err.message,
  });

  }
  
}




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




// --- Add this to the very bottom of your file ---
export const sendEmailAlert = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Array of tough-love quotes to randomize
    const quotes = [
      "Discipline equals freedom. Put the phone down.",
      "Your goals don't care how you feel. Get back to work.",
      "Are you controlling your phone, or is your phone controlling you?",
      "Stop trading your future for cheap dopamine."
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    const { data, error } = await resend.emails.send({
      // ⚠️ IMPORTANT: On the free tier, you MUST use this exact 'from' address
      from: 'onboarding@resend.dev', 
      
      // ⚠️ IMPORTANT: On the free tier, you can ONLY send emails to the email address you used to sign up for Resend!
      to: email, 
      
      subject: "⚔️ PATH OF THE GHOST — Time Has Expired",
      html: `
        <div style="background-color: #0b0c10; padding: 40px 20px; font-family: 'Cinzel', 'Trajan Pro', 'Georgia', serif; text-align: center;">
          
          <!-- Main Container -->
          <div style="max-width: 550px; margin: 0 auto; background-color: #1f2833; border: 2px solid #c5a059; border-radius: 4px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
            
            <!-- Top Samurai Banner Header -->
            <div style="background-color: #0b0c10; padding: 25px 20px; border-bottom: 2px solid #c5a059;">
              <h1 style="color: #c5a059; font-size: 26px; letter-spacing: 4px; margin: 0; text-transform: uppercase;">
                The Ghost's Code
              </h1>
              <p style="color: #6f2232; font-size: 12px; letter-spacing: 6px; margin: 5px 0 0 0; text-transform: uppercase;">
                A Shinobi's Warning
              </p>
            </div>

            <!-- Cinematic Image (Ghost of Tsushima Vibe) -->
            <div style="position: relative; line-height: 0;">
              <img src="https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800" alt="Samurai Discipline" style="width: 100%; height: 260px; object-fit: cover; filter: contrast(110%) brightness(85%);" />
            </div>

            <!-- Content Area -->
            <div style="padding: 35px 30px; text-align: center;">
              
              <h2 style="color: #ffffff; font-size: 22px; letter-spacing: 2px; margin-top: 0; margin-bottom: 15px; text-transform: uppercase;">
                Your Honor Demands Rest
              </h2>
              
              <p style="color: #c5c6c7; font-size: 15px; line-height: 1.6; margin-bottom: 25px;">
                The screen time allotted for your journey has ended. Continuing down this path leads only to distraction, away from your true craft.
              </p>

              <!-- Quote Box (Samurai Scroll Style) -->
              <div style="background-color: #0b0c10; border-left: 4px solid #c5a059; border-right: 4px solid #c5a059; padding: 20px; margin: 25px 0;">
                <p style="color: #e5e5e5; font-size: 15px; font-style: italic; font-family: Georgia, serif; margin: 0; line-height: 1.5;">
                  "${randomQuote}"
                </p>
              </div>

              <p style="color: #8892b0; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; margin-top: 30px; margin-bottom: 0;">
                Sheathe your weapon. Return to reality.
              </p>

            </div>

            <!-- Footer -->
            <div style="background-color: #0b0c10; padding: 15px; border-top: 1px solid #2c3540; text-align: center;">
              <p style="color: #454d59; font-size: 11px; letter-spacing: 2px; margin: 0; text-transform: uppercase;">
                Tsushima Productivity Protocol &bull; Stand Firm
              </p>
            </div>

          </div>
        </div>
      `,
    });

    // Resend doesn't crash the server on failure, it returns an 'error' object.
    // We catch it here and send it to the frontend so you can see if something went wrong.
    if (error) {
      console.error("Resend API Error:", error);
      return res.status(400).json({ 
        success: false, 
        message: "Resend failed to send",
        actualError: error.message 
      });
    }

    return res.status(200).json({
      success: true,
      message: "Alert sent successfully!",
    });
    
  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({
      success: false,
      message: "Backend crashed",
      actualError: error.message
    });
  }
};