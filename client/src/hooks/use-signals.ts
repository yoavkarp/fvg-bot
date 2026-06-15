import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { getSignals, startScan } from "@/lib/api"

export const signalsKey = ["signals"] as const

export function useSignals(options?: { refetchInterval?: number | false }) {
  return useQuery({
    queryKey: signalsKey,
    queryFn: getSignals,
    refetchInterval: options?.refetchInterval ?? false,
  })
}

export function useScan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: startScan,
    onSuccess: () => {
      // The scan runs in the background on the server; refresh the list so any
      // newly written signals show up as they land.
      queryClient.invalidateQueries({ queryKey: signalsKey })
    },
  })
}
