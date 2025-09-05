import fs from "node:fs";
import path from "node:path";
import sql from "better-sqlite3";
import slugify from "slugify";
import xss from "xss";

const dbPath = process.env.VERCEL
  ? path.join("/tmp", "meals.db")
  : path.join(process.cwd(), "meals.db");

const db = sql(dbPath);

export async function getMeals() {
  const statement = db.prepare("SELECT * FROM meals");
  const meals = statement.all();
  return meals;
}

export async function getMeal(slug) {
  return db.prepare("SELECT * FROM meals WHERE slug = ?").get(slug);
  /* to protect against SQL injection, we use a parameterized query
   with a placeholder (the ? character in the SQL statement) */
}

export async function saveMeal(meal) {
  meal.slug = slugify(meal.title, { lower: true });
  meal.instructions = xss(meal.instructions);

  const extension = meal.image.name.split(".").pop();
  const filename = `${meal.slug}.${extension}`;

  const stream = fs.createWriteStream(`public/images/${filename}`);
  const bufferedImage = await meal.image.arrayBuffer();
  stream.write(Buffer.from(bufferedImage), (error) => {
    if (error) {
      throw new Error("Image upload failed.");
    }
  });

  meal.image = `/images/${filename}`;
  db.prepare(
    `
    INSERT INTO meals 
      (title, summary, instructions, creator, creator_email, image, slug) 
    VALUES 
      (@title, @summary, @instructions, @creator, @creator_email, @image, @slug)
  `,
  ).run(meal);
}
