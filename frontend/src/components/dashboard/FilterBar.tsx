import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect, Option } from "@/components/ui/multi-select";
import { Label } from "@/components/ui/label";

interface FilterBarProps {
  filters: {
    subject: string;
    year: string[];
    topic: string[];
    session: string[];
    difficulty: string;
  };
  setFilters: (filters: FilterBarProps['filters']) => void;
  onSubmit: () => void;
}

export const FilterBar = ({ filters, setFilters, onSubmit }: FilterBarProps) => {
  const subjects = ["Pure 1", "Pure 3", "Mechanics", "Stats 1", "Stats 2"];
  const years: Option[] = ["2020", "2021", "2022", "2023", "2024", "2025"].map(year => ({
    label: year,
    value: year
  }));
  
  // Dynamic topics based on selected paper
  const getTopicsForPaper = (paper: string): string[] => {
    switch (paper) {
      case "Pure 3":
        return [
          "Algebra",
          "Logarithmic and exponential functions",
          "Trigonometry",
          "Differentiation",
          "Integration",
          "Numerical solution of equations",
          "Vectors",
          "Differential equations",
          "Complex numbers"
        ];
      case "Pure 1":
        return [
          "Quadratics",
          "Functions",
          "Coordinate geometry",
          "Circular measure",
          "Trigonometry",
          "Series",
          "Differentiation",
          "Integration"
        ];
      case "Stats 1":
        return [
          "Representation of data",
          "Permutations and combinations",
          "Probability",
          "Discrete random variables",
          "The normal distribution"
        ];
      case "Stats 2":
        return [
          "The Poisson distribution",
          "Linear combinations of random variables",
          "Continuous random variables",
          "Sampling and estimation",
          "Hypothesis tests"
        ];
      case "Mechanics":
        return [
          "Forces and equilibrium",
          "Kinematics of motion in a straight line",
          "Momentum",
          "Newton's laws of motion",
          "Energy, work and power"
        ];
      default:
        return [];
    }
  };

  const topics: Option[] = getTopicsForPaper(filters.subject).map(topic => ({
    label: topic,
    value: topic
  }));
  
  const sessions: Option[] = ["May/June", "Oct/Nov", "Feb/March"].map(session => ({
    label: session,
    value: session
  }));
  const difficulties = ["All", "Easy", "Medium", "Hard"];

  // Handle paper change - clear topics when paper changes
  const handlePaperChange = (value: string) => {
    setFilters({
      ...filters, 
      subject: value,
      topic: [] // Clear topics when paper changes
    });
  };

  return (
    <Card className="p-6 mb-8 bg-gradient-to-r from-orange-50/80 to-yellow-50/80 border-orange-200/50 shadow-md backdrop-blur-sm">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px] space-y-2">
          <Label className="text-sm font-semibold text-orange-800 flex items-center gap-1">
            📝 Paper(s)
          </Label>
          <Select value={filters.subject} onValueChange={handlePaperChange}>
            <SelectTrigger className="bg-white/90 border-orange-200 rounded-2xl h-12 hover:bg-white transition-colors shadow-sm text-gray-900">
              <SelectValue placeholder="Select Paper..." />
            </SelectTrigger>
            <SelectContent className="bg-white border-orange-200 rounded-xl">
              {subjects.map(subject => (
                <SelectItem key={subject} value={subject} className="rounded-lg text-gray-900">{subject}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px] space-y-2">
          <Label className="text-sm font-semibold text-orange-800 flex items-center gap-1">
            🗓️ Year(s)
          </Label>
          <MultiSelect 
            options={years}
            selected={filters.year}
            onChange={(selected) => setFilters({...filters, year: selected})}
            placeholder="Select Years..."
          />
        </div>

        <div className="flex-1 min-w-[200px] space-y-2">
          <Label className="text-sm font-semibold text-orange-800 flex items-center gap-1">
            📚 Topic(s)
          </Label>
          <MultiSelect 
            options={topics}
            selected={filters.topic}
            onChange={(selected) => setFilters({...filters, topic: selected})}
            placeholder="Select Topics..."
          />
        </div>

        <div className="flex-1 min-w-[200px] space-y-2">
          <Label className="text-sm font-semibold text-orange-800 flex items-center gap-1">
            🌍 Season(s)
          </Label>
          <MultiSelect 
            options={sessions}
            selected={filters.session}
            onChange={(selected) => setFilters({...filters, session: selected})}
            placeholder="Select Seasons..."
          />
        </div>

        <div className="flex-1 min-w-[200px] space-y-2">
          <Label className="text-sm font-semibold text-orange-800 flex items-center gap-1">
            ⚡ Difficulty
          </Label>
          <Select value={filters.difficulty} onValueChange={(value) => setFilters({...filters, difficulty: value})}>
            <SelectTrigger className="bg-white/90 border-orange-200 rounded-2xl h-12 hover:bg-white transition-colors shadow-sm text-gray-900">
              <SelectValue placeholder="Select Difficulty..." />
            </SelectTrigger>
            <SelectContent className="bg-white border-orange-200 rounded-xl">
              {difficulties.map(difficulty => (
                <SelectItem key={difficulty} value={difficulty} className="rounded-lg text-gray-900">{difficulty}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={onSubmit}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white h-12 px-6 rounded-2xl flex-shrink-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <Search className="h-5 w-5" />
        </Button>
      </div>
    </Card>
  );
};