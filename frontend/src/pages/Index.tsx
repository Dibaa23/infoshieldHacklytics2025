import { HighlightTooltip } from "@/components/HighlightTooltip";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          Highlight Text to Check Credibility
        </h1>
        
        <div className="prose dark:prose-invert">
          <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
            The Earth is approximately 4.54 billion years old, with an error range of about 50 million years. Scientists have determined this age through radiometric dating of meteorite material, which corresponds to the ages of the oldest-known rocks and minerals.
          </p>
          
          <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
            Climate change is causing global temperatures to rise. The planet's average surface temperature has risen about 2.0 degrees Fahrenheit (1.1 degrees Celsius) since the late 19th century, a change driven largely by increased carbon dioxide emissions and other human activities.
          </p>
          
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Try highlighting any text above to see the credibility score tooltip appear!
          </p>
        </div>
      </div>
      <HighlightTooltip />
    </div>
  );
};

export default Index;