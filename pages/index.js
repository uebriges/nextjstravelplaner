import { TextField } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Head from 'next/head';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <p>
          <TextField id="standard-basic" label="Standard" />
        </p>
        <Button variant="contained" color="secondary" size="large">
          Search
        </Button>
        <div id="map"></div>
      </main>

      <footer></footer>
    </div>
  );
}
