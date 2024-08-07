/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Button } from '@mui/material';
import 'next';
import Link from 'next/link';

const indexPageLinkStyle = css`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-image: url('indexBackground.jpg');
  background-size: 100% 100%;
  flex-direction: column;
`;

const introTextStyle = css`
  color: #ffffff;
  font-size: 30px;
`;

export default function Home() {
  return (
    <main css={indexPageLinkStyle}>
      <p css={introTextStyle}>Wanna travel again?</p>
      <Link href="/travelplaner" passHref>
        <Button variant="contained" color="primary">
          Start planning...
        </Button>
      </Link>
    </main>
  );
}
