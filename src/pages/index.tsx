import Link from 'next/link'

export default function Home() {
  return (
    <>
      <Link href='/login' passHref>
        ログイン
      </Link>
      <br />
      <Link href='/userinfo' passHref>
        userinfo
      </Link>
      <br />
      <Link href='/registration' passHref>
        登録
      </Link>
    </>
  )
}
