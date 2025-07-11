import { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skull, AlertTriangle, ArrowLeft } from "lucide-react";

export default function DeathMode() {
  const [confirmations, setConfirmations] = useState({
    understand: false,
    cannotQuit: false,
    accountRisk: false,
    psychological: false,
    finalConfirm: false
  });

  const allConfirmed = Object.values(confirmations).every(Boolean);

  const handleConfirmation = (key: keyof typeof confirmations) => {
    setConfirmations(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const enterDeathMode = () => {
    if (allConfirmed) {
      window.location.href = '/game/death-mode-' + Date.now();
    }
  };

  return (
    <div className="min-h-screen bg-game-primary text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <Skull className="text-game-accent text-6xl animate-pulse" />
              <h1 className="text-6xl font-bold text-game-accent">DEATH MODE</h1>
              <Skull className="text-game-accent text-6xl animate-pulse" />
            </div>
            <Badge variant="destructive" className="bg-game-accent text-lg px-4 py-2">
              EXTREME PSYCHOLOGICAL WARFARE
            </Badge>
          </div>

          <Card className="bg-game-secondary border-game-accent mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-game-accent flex items-center">
                <AlertTriangle className="mr-2" />
                WARNING: READ CAREFULLY
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="bg-red-900 border-red-500 mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-red-200">
                  <strong>DEATH MODE IS IRREVERSIBLE</strong><br />
                  Once you start, there is no going back. This is not a game - it's psychological warfare.
                </AlertDescription>
              </Alert>

              <div className="space-y-6">
                <div className="bg-game-primary p-4 rounded-lg">
                  <h3 className="font-bold text-game-accent mb-3">Death Mode Rules:</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• <strong>NO QUITTING:</strong> Cannot leave game once started</li>
                    <li>• <strong>AI OPPONENTS:</strong> Hidden AI players disguised as humans</li>
                    <li>• <strong>ONE EXIT METHOD:</strong> Must physically go to "the house" and enter Account PIN</li>
                    <li>• <strong>SINGLE ESCAPE:</strong> Only PIN enterer can exit</li>
                    <li>• <strong>2000-MOVE LIMIT:</strong> Game auto-terminates after 2000 total moves</li>
                    <li>• <strong>IMPOSSIBLE VICTORY:</strong> AI opponents ensure no human team can win naturally</li>
                    <li>• <strong>OWNER OVERRIDE:</strong> Only game owner can run victory command</li>
                  </ul>
                </div>

                <div className="bg-game-primary p-4 rounded-lg">
                  <h3 className="font-bold text-game-accent mb-3">Consequences:</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• <strong>VICTORY REWARD:</strong> 10^10 trillion points (theoretical only)</li>
                    <li>• <strong>STALEMATE PENALTY:</strong> 10^-10 points for all trapped players</li>
                    <li>• <strong>ACCOUNT DELETION:</strong> Winner can delete opponent accounts permanently</li>
                    <li>• <strong>MUTUAL DESTRUCTION:</strong> Using deletion power destroys winner's account too</li>
                    <li>• <strong>ACCOUNT INHERITANCE:</strong> Escaped player gains access to all trapped accounts</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-game-secondary border-game-accent mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Confirmation Required</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="understand"
                    checked={confirmations.understand}
                    onCheckedChange={() => handleConfirmation('understand')}
                  />
                  <label htmlFor="understand" className="text-sm cursor-pointer">
                    I understand that Death Mode is a psychological warfare game with real consequences
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="cannotQuit"
                    checked={confirmations.cannotQuit}
                    onCheckedChange={() => handleConfirmation('cannotQuit')}
                  />
                  <label htmlFor="cannotQuit" className="text-sm cursor-pointer">
                    I acknowledge that I cannot quit once the game starts
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="accountRisk"
                    checked={confirmations.accountRisk}
                    onCheckedChange={() => handleConfirmation('accountRisk')}
                  />
                  <label htmlFor="accountRisk" className="text-sm cursor-pointer">
                    I accept the risk of account deletion and point penalties
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="psychological"
                    checked={confirmations.psychological}
                    onCheckedChange={() => handleConfirmation('psychological')}
                  />
                  <label htmlFor="psychological" className="text-sm cursor-pointer">
                    I am mentally prepared for the psychological pressure and intensity
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="finalConfirm"
                    checked={confirmations.finalConfirm}
                    onCheckedChange={() => handleConfirmation('finalConfirm')}
                  />
                  <label htmlFor="finalConfirm" className="text-sm cursor-pointer text-game-accent font-semibold">
                    I willingly enter Death Mode and accept all consequences
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex space-x-4">
            <Link href="/">
              <Button variant="secondary" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Safety</span>
              </Button>
            </Link>
            
            <Button 
              onClick={enterDeathMode}
              disabled={!allConfirmed}
              className="flex-1 bg-game-accent hover:bg-red-700 text-xl font-bold py-4"
            >
              <Skull className="mr-2 h-6 w-6" />
              ENTER DEATH MODE
            </Button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              By entering Death Mode, you acknowledge that this is an extreme gaming experience<br />
              and accept full responsibility for your participation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
