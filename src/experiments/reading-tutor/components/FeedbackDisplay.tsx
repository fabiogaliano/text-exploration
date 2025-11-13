import { Streamdown } from "streamdown";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { CheckCircle2, AlertCircle } from "lucide-react";
import type { Analysis, Reanalysis } from "../schemas";

interface FeedbackDisplayProps {
  analysis: Analysis | Reanalysis;
  attemptNumber: number;
}

/**
 * Component for displaying AI feedback and score
 */
export function FeedbackDisplay({
  analysis,
  attemptNumber,
}: FeedbackDisplayProps) {
  const { score, feedback, strengths, improvements } = analysis;
  const progressNote = "progressNote" in analysis ? analysis.progressNote : null;

  // Determine score color
  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600 dark:text-green-400";
    if (score >= 70) return "text-blue-600 dark:text-blue-400";
    if (score >= 50) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Feedback - Attempt {attemptNumber}</CardTitle>
          <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
            {score}/100
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Note (only for re-analysis) */}
        {progressNote && (
          <div className="bg-muted rounded-lg p-4">
            <h4 className="mb-2 font-semibold">Progress</h4>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <Streamdown isAnimating={false}>{progressNote}</Streamdown>
            </div>
          </div>
        )}

        {/* Overall Feedback */}
        <div>
          <h4 className="mb-2 font-semibold">Overall Feedback</h4>
          <div className="text-muted-foreground prose prose-sm dark:prose-invert max-w-none">
            <Streamdown isAnimating={false}>{feedback}</Streamdown>
          </div>
        </div>

        {/* Strengths */}
        {strengths.length > 0 && (
          <div>
            <h4 className="mb-2 flex items-center gap-2 font-semibold">
              <CheckCircle2 className="text-green-600 dark:text-green-400 h-5 w-5" />
              Strengths
            </h4>
            <div className="text-sm">
              <Streamdown isAnimating={false}>
                {strengths.map(s => `- ${s}`).join('\n')}
              </Streamdown>
            </div>
          </div>
        )}

        {/* Areas for Improvement */}
        {improvements.length > 0 && (
          <div>
            <h4 className="mb-2 flex items-center gap-2 font-semibold">
              <AlertCircle className="text-orange-600 dark:text-orange-400 h-5 w-5" />
              Areas for Improvement
            </h4>
            <div className="text-sm">
              <Streamdown isAnimating={false}>
                {improvements.map(i => `- ${i}`).join('\n')}
              </Streamdown>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
