import { H1, H2, H3, H4 } from "@routine-flow/ui/components/typography/Heading";
import { Large } from "@routine-flow/ui/components/typography/Large";
import { Lead } from "@routine-flow/ui/components/typography/Lead";
import { Li, Ol, Ul } from "@routine-flow/ui/components/typography/List";
import { Muted } from "@routine-flow/ui/components/typography/Muted";
import { P } from "@routine-flow/ui/components/typography/Paragraph";
import { Small } from "@routine-flow/ui/components/typography/Small";
import { Button } from "@routine-flow/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@routine-flow/ui/components/ui/card";
import { Input } from "@routine-flow/ui/components/ui/input";
import { Label } from "@routine-flow/ui/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@routine-flow/ui/components/ui/select";

export default function Home() {
  return (
    <div className="p-20 flex flex-col gap-4 justify-center items-center">
      <Button>Button</Button>
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Create project</CardTitle>
          <CardDescription>
            Deploy your new project in one-click.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Name of your project" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="framework">Framework</Label>
                <Select>
                  <SelectTrigger id="framework">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="next">Next.js</SelectItem>
                    <SelectItem value="sveltekit">SvelteKit</SelectItem>
                    <SelectItem value="astro">Astro</SelectItem>
                    <SelectItem value="nuxt">Nuxt.js</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Cancel</Button>
          <Button>Deploy</Button>
        </CardFooter>
      </Card>

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
