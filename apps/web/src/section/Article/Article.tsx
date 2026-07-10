import { Markdown } from 'src/common/Markdown'
import type { Gist } from 'src/types/github'
import { View } from 'src/theme/View'

export interface ArticleProps {
  data: Gist
}

export function Article({ data }: Readonly<ArticleProps>) {
  return (
    <View as="section" maxWidth="1280px" minWidth={0} mx="auto" p={4} mt={3} mb={4}>
      <Markdown>{data.files['en.md'].content}</Markdown>
    </View>
  )
}
