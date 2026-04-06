import { notFound } from "next/navigation"
import { PropsWithChildren, use } from "react"

interface ContentProps {
  crawlId: number
}

const Content = ({ crawlId }: ContentProps) => {
  return <div></div>
}

const Page = ({
  params,
}: PropsWithChildren<{ params: Promise<{ crawlId: string }> }>) => {
  const { crawlId } = use(params)
  return isNaN(Number(crawlId)) ? (
    notFound()
  ) : (
    <Content crawlId={Number(crawlId)} />
  )
}

export default Page
