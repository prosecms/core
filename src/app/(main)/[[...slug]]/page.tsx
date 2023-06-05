import Handlebars from "handlebars";
import { getThemeMetadata } from "lib/metadata";
import { notFound } from "next/navigation";

type Props = {
  params: {
    slug: string[];
  };
};

// TODO: Handle Slug
export default async function ThemedPage({ params: { slug } }: Props) {
  const metadata = await getThemeMetadata();

  try {
    const themeResponse = await fetch(`${process.env.BASE_URL}/theme/index`);
    const themeHtml = await themeResponse.text();

    const handlebars = Handlebars.create();
    const theme = handlebars.compile(themeHtml);

    return (
      // rome-ignore lint/security/noDangerouslySetInnerHtml: I know it is dangerous
      <div id="__root" dangerouslySetInnerHTML={{ __html: theme(metadata) }} />
    );
  } catch (e) {
    console.error(e);
    notFound();
  }
}
