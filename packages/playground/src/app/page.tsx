import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  H1,
  H2,
  H3,
  H4,
  Large,
  Lead,
  Ul,
  Ol,
  Li,
  Muted,
  P,
  Small,
} from "@routine-flow/ui";

export default function Home() {
  return (
    <div className="p-20 flex flex-col gap-4 justify-center items-center">
      <Button>Button</Button>

      <Large>Typography</Large>

      <H1>Heading 1</H1>
      <H2>Heading 2</H2>
      <H3>Heading 3</H3>
      <H4>Heading 4</H4>

      <Lead>Lead</Lead>

      <Large>Large</Large>

      <P>Paragraph</P>

      <Muted>Muted</Muted>

      <Small>Small</Small>

      <Ul>
        <Li>Item 1</Li>
        <Li>Item 2</Li>
        <Li>Item 3</Li>
      </Ul>

      <Ol>
        <Li>Item 1</Li>
        <Li>Item 2</Li>
        <Li>Item 3</Li>
      </Ol>
    </div>
  );
}
