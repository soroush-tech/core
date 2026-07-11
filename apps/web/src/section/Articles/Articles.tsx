import { View } from 'src/theme/View'
import { Flex } from 'src/theme/Flex'
import { Avatar } from 'src/theme/Avatar'
import { Typography } from 'src/theme/Typography'
import { NavLink } from 'src/common/NavLink'
import { useGists } from 'src/hooks/useGists'
import { readingTime } from 'src/utils/readingTime'
import { authorName } from 'src/utils/authorName'
import { formatDate, estimateWordCount } from './utils'
import { Card } from 'src/theme/Card'

export function Articles() {
  const { data } = useGists()
  return (
    <View as="section" maxWidth="1280px" width="100%" mx="auto" mt={3} mb={4} px={4}>
      {data.map((gist) => (
        <Card
          variant="bracketBox"
          key={gist.id}
          as="section"
          maxWidth="1280px"
          width="100%"
          mx="auto"
          bg="paper"
          p={4}
          my={2}
          alignItems="center"
          flexDirection="row"
          gap={2}
          borderColor="light"
          borderWidth="thin"
          borderStyle="solid"
          transition="background-color 0.2s ease"
        >
          <Avatar size="md" src={gist.owner.avatar_url} alt={authorName(gist.owner.login)} />
          <Flex flexDirection="column" gap={1}>
            <NavLink color="primary" fontSize={4} href={`/article/${gist.id}/`}>
              {gist.description}
            </NavLink>
            <Flex flexDirection="row" alignItems="center" gap={1}>
              <Typography variant="body2" color="secondary" m={0}>
                {authorName(gist.owner.login)}
              </Typography>
              <Typography variant="body2" color="secondary" m={0} aria-hidden>
                ·
              </Typography>
              <Typography
                as="time"
                dateTime={gist.created_at}
                variant="body2"
                color="secondary"
                m={0}
              >
                {formatDate(gist.created_at)}
              </Typography>
              <Typography variant="body2" color="secondary" m={0} aria-hidden>
                ·
              </Typography>
              <Typography variant="body2" color="secondary" m={0}>
                {readingTime(estimateWordCount(gist.files))} min read
              </Typography>
            </Flex>
          </Flex>
        </Card>
      ))}
    </View>
  )
}
