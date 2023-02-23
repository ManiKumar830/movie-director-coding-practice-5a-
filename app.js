const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "moviesData.db");

const app = express();
app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`Database Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

//Returns a list of all movie names in the movie table
//API 1

const convertDbObjectToResponseObject = (movieObject) => {
  return {
    movieName: movieObject.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMovieQuery = `
    SELECT 
    * 
    FROM 
    movie;`;

  const movieArray = await database.all(getMovieQuery);
  response.send(
    movieArray.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

//Creates a new movie in the movie table. movie_id is auto-incremented
//API 2

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovieQuery = `
    INSERT INTO
    movie (director_id, movie_name, lead_actor)
    VALUES 
    ('${directorId}', '${movieName}', '${leadActor}');`;

  const playerMovieQueryResponse = await database.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

//Returns a movie based on the movie ID
//API 3

const getAllMovieQuery = (movieObject) => {
  return {
    movieId: movieObject.movie_id,
    directorId: movieObject.director_id,
    movieName: movieObject.movie_name,
    leadActor: movieObject.lead_actor,
  };
};

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const getMovieQuery = `
    SELECT 
    *
    FROM 
    movie
    WHERE movie_id = ${movieId};`;

  const getMovieQueryResponse = await database.get(getMovieQuery);
  response.send(getAllMovieQuery(getMovieQueryResponse));
});

//Updates the details of a movie in the movie table based on the movie ID
//API 4

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const { directorId, movieName, leadActor } = request.body;

  const putMovieDetails = `
    UPDATE 
    movie 
    SET 
    director_id = '${directorId}',
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE 
    movie_id = ${movieId};`;

  await database.run(putMovieDetails);
  response.send("Movie Details Updated");
});

//Deletes a movie from the movie table based on the movie ID
//API 5

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const deleteMovieDetails = `
    DELETE FROM
    movie
    WHERE movie_id = ${movieId};`;

  await database.run(deleteMovieDetails);
  response.send("Movie Removed");
});

//Returns a list of all directors in the director table
//API 6

const getAllDirectorDetails = (directorObject) => {
  return {
    directorId: directorObject.director_id,
    directorName: directorObject.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `
    SELECT 
    * FROM
    director`;

  const getDirectorQueryResponse = await database.all(getDirectorQuery);
  response.send(
    getDirectorQueryResponse.map((eachDirector) =>
      getAllDirectorDetails(eachDirector)
    )
  );
});

//Returns a list of all movie names directed by a specific director
//API 7

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;

  const directorQuery = `
    SELECT 
    movie_name as movieName
    FROM
    movie 
    WHERE 
    director_id = ${directorId};`;

  const directorQueryResponse = await database.all(directorQuery);
  response.send(directorQueryResponse);
});

module.exports = app;
