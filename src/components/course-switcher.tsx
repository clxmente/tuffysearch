"use client";

import { useState } from "react";

import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

import { Copy, ChevronLeft, ChevronRight } from "lucide-react";

interface Metadata {
  course_code: string;
  description: string;
  title: string;
}

interface Matches {
  id: string;
  metadata: Metadata;
  score: number;
  values: never;
}

export function CourseSwitcher({ matches }: { matches: Matches[] }) {
  const { toast } = useToast();

  const [index, setIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);

  return (
    <div className="flex-col space-y-4">
      <Button variant="secondary" onClick={() => setShowAll((prev) => !prev)}>
        {showAll ? "Show Less Results" : "Show All Results"}
      </Button>

      {showAll &&
        matches.map((match) => (
          <Card className="w-full overflow-y-auto" key={match.id}>
            <CardHeader>
              <CardTitle className="flex items-start justify-between">
                {`${match.metadata.course_code}: ${match.metadata.title}`}

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        variant="outline"
                        size="icon"
                        className="ml-2 flex-none"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${match.metadata.course_code}: ${match.metadata.title}\n${match.metadata.description}`,
                          );
                          toast({
                            title: "Copied to clipboard",
                            description:
                              "Course title and description copied to clipboard",
                          });
                        }}
                      >
                        <Copy className="h-5 w-5" />
                      </Button>
                      <TooltipContent side="bottom">
                        Copy course information to clipboard
                      </TooltipContent>
                    </TooltipTrigger>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
              {/* <CardDescription>{`Class ${index + 1}/20`}</CardDescription> */}
            </CardHeader>
            <CardContent>
              <CardDescription>{match.metadata.description}</CardDescription>
            </CardContent>
          </Card>
        ))}

      {!showAll && (
        <>
          <Card className="h-[230px] w-full overflow-y-auto md:h-[194px]">
            <CardHeader>
              <CardTitle className="flex items-start justify-between">
                {`${matches[index].metadata.course_code}: ${matches[index].metadata.title}`}

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        variant="outline"
                        size="icon"
                        className="ml-2 flex-none"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${matches[index].metadata.course_code}: ${matches[index].metadata.title}\n${matches[index].metadata.description}`,
                          );
                          toast({
                            title: "Copied to clipboard",
                            description:
                              "Course title and description copied to clipboard",
                          });
                        }}
                      >
                        <Copy className="h-5 w-5" />
                      </Button>
                      <TooltipContent side="bottom">
                        Copy course information to clipboard
                      </TooltipContent>
                    </TooltipTrigger>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
              {/* <CardDescription>{`Class ${index + 1}/20`}</CardDescription> */}
            </CardHeader>
            <CardContent>
              <CardDescription>
                {matches[index].metadata.description}
              </CardDescription>
            </CardContent>
          </Card>

          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              disabled={index === 0}
              onClick={() => setIndex((prev) => prev - 1)}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Prev Class
            </Button>
            <Button
              variant="outline"
              disabled={index === matches.length - 1}
              onClick={() => setIndex((prev) => prev + 1)}
            >
              Next Class
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <p className="tetx-neutral-500 text-center text-sm dark:text-neutral-400">
            Showing {`${index + 1}/${matches.length}`} results
          </p>
        </>
      )}
    </div>
  );
}
