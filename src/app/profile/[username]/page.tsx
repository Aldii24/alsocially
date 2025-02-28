const page = ({params}: {params: {username: string}}) => {

  const username = params.username

  return (
    <div>
       {username}
    </div>
  )
}

export default page
